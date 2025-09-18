import { useState, useCallback, useEffect } from "react";
import GlassEffect from "./GlassEffect";
import { Level, GamePhase, PatternType, CellPosition } from "../types/game";
import { PATTERNS } from "../constants/game";

// Dynamic scaling based on viewport width (baseline: 1512px = 100%)
// Less dramatic scaling: blend 50% of proportional scaling with 50% fixed scaling
const getViewportScale = () => {
    const proportionalScale = Math.min(1.0, window.innerWidth / 1512);
    const blendedScale = 0.5 + (proportionalScale * 0.5);
    return blendedScale;
};


interface BoardProps {
    onAnimationStart?: () => void;
    onAnimationComplete?: () => void;
    shouldPlay?: boolean;
    onLevelChange?: (level: Level, moves: number, gamePhase: GamePhase) => void;
    shouldReset?: boolean;
    gameStarted?: boolean;
    shouldStartNewGame?: boolean;
}


const Board: React.FC<BoardProps> = ({onAnimationStart, onAnimationComplete, shouldPlay, onLevelChange, shouldReset, gameStarted, shouldStartNewGame}) => {
    const [cells, setCells] = useState<CellPosition[]>([]);
    const [currentLevel, setCurrentLevel] = useState<Level>();
    const [gamePhase, setGamePhase] = useState<GamePhase>('ready');
    const [moves, setMoves] = useState(0);
    const [initialScrambledState, setInitialScrambledState] = useState<CellPosition[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const [hasEverStarted, setHasEverStarted] = useState(false);
    const [viewportScale, setViewportScale] = useState(getViewportScale());

    // Handle viewport resize
    useEffect(() => {
        const handleResize = () => {
            setViewportScale(getViewportScale());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update CSS custom property for background grid scaling
    useEffect(() => {
        const scaledGridSize = Math.round(25 * viewportScale);
        document.documentElement.style.setProperty('--grid-size', `${scaledGridSize}px`);
    }, [viewportScale]);

    // Calculate scaled dimensions based on current viewport
    const CELL_WIDTH = Math.round(100 * viewportScale);
    const CELL_OFFSET = Math.round(CELL_WIDTH * 1.15);

    // Generate a standard game configuration
    const generateLevel = useCallback((): Level => {
        const n = 5; // Fixed 5x5 grid
        const scrambleMoves = 12; // Exactly 12 scramble moves
        const pattern: PatternType = 'cross';

        return {
            level: 1,
            n,
            pattern,
            scrambleMoves,
            name: `${PATTERNS[pattern].name}`
        };
    }, []);

    const applyPattern = useCallback((cellId: string, patternType: PatternType) => {
        if (!currentLevel) return;

        setCells(prev => {
            // Find the clicked cell
            const clickedCell = prev.find(cell => cell.id === cellId);
            if (!clickedCell) return prev;

            const pattern = PATTERNS[patternType];
            const clickedRow = clickedCell.gridRow;
            const clickedCol = clickedCell.gridCol;

            return prev.map(cell => {
                // Check if this cell should be affected by the pattern
                const shouldToggle = pattern.offsets.some(([dr, dc]) => {
                    const targetRow = clickedRow + dr;
                    const targetCol = clickedCol + dc;

                    // Boundary check
                    if (targetRow < 0 || targetRow >= currentLevel.n ||
                        targetCol < 0 || targetCol >= currentLevel.n) {
                        return false;
                    }

                    return cell.gridRow === targetRow && cell.gridCol === targetCol;
                });

                return shouldToggle ? { ...cell, needTurnOff: !cell.needTurnOff } : cell;
            });
        });
    }, [currentLevel]);

    const handleCellClick = useCallback((cellId: string) => {
        // If it's the initial state with play button, start the game
        if (cells.length === 1 && gamePhase === 'ready') {
            setGamePhase('animation');
            return;
        }

        // Normal gameplay - only allow clicks during playing phase, not when won
        if (gamePhase !== 'playing' || !currentLevel) return;

        // Apply pattern toggle
        applyPattern(cellId, currentLevel.pattern);
        setMoves(prev => prev + 1);
    }, [gamePhase, currentLevel, applyPattern, cells.length]);

    // Win detection effect - only check when in playing phase and cells change
    useEffect(() => {
        if (gamePhase === 'playing' && cells.length > 0 && cells.every(cell => !cell.needTurnOff) && currentLevel) {
            setGamePhase('won');
        }
    }, [cells, currentLevel, gamePhase]);

    // Notify parent about level/game state changes
    useEffect(() => {
        if (currentLevel && onLevelChange) {
            onLevelChange(currentLevel, moves, gamePhase);
        }
    }, [currentLevel, moves, gamePhase, onLevelChange]);

    const createGrid = useCallback(async () => {
        if (!currentLevel) return;

        const n = currentLevel.n;
        setGamePhase('animation');

        onAnimationStart?.();
        setHasEverStarted(true);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // PHASE 1: Create horizontal row
        const horizontalRow = await createHorizontalRow(centerX, centerY, n);

        // If only 1 cell, we're done
        if (n === 1) {
            // Show chip for single cell
            setCells(prev => prev.map(cell => ({ ...cell, animate: false })));
            onAnimationComplete?.();
            return;
        }

        // Wait a moment before starting vertical duplication
        await new Promise(resolve => setTimeout(resolve, 200));

        // PHASE 2: Create vertical grid
        await createVerticalGrid(horizontalRow, centerX, centerY, n);


        // Show chips by stopping all animations
        setCells(prev => prev.map(cell => ({ ...cell, animate: false })));

        // Index cells based on their actual final positions for accurate pattern mapping
        setCells(prev => {
            // Sort cells by Y position (top to bottom), then by X position (left to right)
            const sortedCells = [...prev].sort((a, b) => {
                if (Math.abs(a.y - b.y) < 10) { // Same row (within 10px tolerance)
                    return a.x - b.x; // Sort by X position
                }
                return a.y - b.y; // Sort by Y position
            });

            // Assign grid coordinates based on actual positions
            const reindexedCells = sortedCells.map((cell, index) => {
                const row = Math.floor(index / n);
                const col = index % n;
                return {
                    ...cell,
                    gridRow: row,
                    gridCol: col
                };
            });

            return reindexedCells;
        });

        // After grid animation completes, start scramble phase
        setGamePhase('scrambling');

        // Wait a bit for cells state to update after re-indexing
        await new Promise(resolve => setTimeout(resolve, 200));

        // Switch all cells to active (needTurnOff: false) before scrambling
        setCells(currentCells => currentCells.map(cell => ({ ...cell, needTurnOff: false })));
        await new Promise(resolve => setTimeout(resolve, 100));

        // Apply random pattern toggles to scramble the grid
        for (let i = 0; i < currentLevel.scrambleMoves; i++) {
            // Get current cells state and pick a random cell
            setCells(currentCells => {
                const randomIndex = Math.floor(Math.random() * currentCells.length);
                const randomCell = currentCells[randomIndex];

                if (!randomCell) return currentCells;

                // Apply pattern directly in setState to avoid dependency on cells
                const pattern = PATTERNS[currentLevel.pattern];
                const clickedRow = randomCell.gridRow;
                const clickedCol = randomCell.gridCol;

                return currentCells.map(cell => {
                    // Check if this cell should be affected by the pattern
                    const shouldToggle = pattern.offsets.some(([dr, dc]) => {
                        const targetRow = clickedRow + dr;
                        const targetCol = clickedCol + dc;

                        // Boundary check
                        if (targetRow < 0 || targetRow >= currentLevel.n ||
                            targetCol < 0 || targetCol >= currentLevel.n) {
                            return false;
                        }

                        return cell.gridRow === targetRow && cell.gridCol === targetCol;
                    });

                    return shouldToggle ? { ...cell, needTurnOff: !cell.needTurnOff } : cell;
                });
            });

            // Quick delay between scramble moves for visual effect
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Save the initial scrambled state and start the game
        setCells(currentCells => {
            setInitialScrambledState([...currentCells]);
            return currentCells;
        });
        setGamePhase('playing');
        setMoves(0);

        onAnimationComplete?.();
    }, [currentLevel, onAnimationStart, onAnimationComplete]);

    const reverseToCenter = useCallback(async () => {
        if (!currentLevel) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // First: Turn off all cells to remove expensive visual effects
        setGamePhase('reversing');
        setCells(currentCells => currentCells.map(cell => ({ ...cell, needTurnOff: true })));

        // Wait for cells to turn off
        await new Promise(resolve => setTimeout(resolve, 200));

        // Then: Start movement to center and fade out
        setGamePhase('fadingOut');
        setCells(currentCells => {
            // Find a cell that's not already at center to keep visible
            const centerThreshold = 50; // pixels
            let keepCellIndex = 0;
            for (let i = 0; i < currentCells.length; i++) {
                const distanceFromCenter = Math.sqrt(
                    Math.pow(currentCells[i].x - centerX, 2) +
                    Math.pow(currentCells[i].y - centerY, 2)
                );
                if (distanceFromCenter > centerThreshold) {
                    keepCellIndex = i;
                    break;
                }
            }

            return currentCells.map((cell, index) => ({
                ...cell,
                x: centerX,
                y: centerY,
                animate: true,
                shouldFadeOut: index !== keepCellIndex, // Only the selected cell doesn't fade out
                needTurnOff: index === keepCellIndex ? true : cell.needTurnOff // Make the remaining cell inactive (red)
            }));
        });

        // Wait for both movement and fade to complete
        await new Promise(resolve => setTimeout(resolve, 800));

        // Reset to initial state and start new game
        setGamePhase('ready');
        setMoves(0);
        setInitialScrambledState([]);
        setIsResetting(false);

        // Keep only the center cell that didn't fade out
        setCells(currentCells => {
            const remainingCell = currentCells.find(cell => !cell.shouldFadeOut);
            if (remainingCell) {
                return [{
                    ...remainingCell,
                    id: 'cell-0',
                    animate: false,
                    shouldFadeOut: false,
                    gridRow: 0,
                    gridCol: 0
                }];
            } else {
                // Fallback: create new cell
                const initialCell = { id: `cell-0`, x: centerX, y: centerY, animate: false, needTurnOff: true, gridRow: 0, gridCol: 0 };
                return [initialCell];
            }
        });

        // Trigger the start animation
        await new Promise(resolve => setTimeout(resolve, 100));
        setGamePhase('animation');
    }, [currentLevel]);

    // Initialize game - only run once on mount
    useEffect(() => {
        if (!currentLevel) {
            const gameLevel = generateLevel();
            setCurrentLevel(gameLevel);
        }
    }, [generateLevel]); // Remove currentLevel from dependencies to avoid loop

    const createHorizontalRow = async (centerX: number, centerY: number, n: number): Promise<CellPosition[]> => {
        // Start with the initial cell
        const initialCell = { id: `cell-0`, x: centerX, y: centerY, animate: false, needTurnOff: true, gridRow: 0, gridCol: 0 };
        setCells([initialCell]);

        if (n === 1) {
            return [initialCell];
        }

        // Small delay to ensure initial render
        await new Promise(resolve => setTimeout(resolve, 50));

        let currentCells: CellPosition[] = [];

        if (n % 2 === 0) {
            // Even n: Start with 2 cells at center, then animate them apart
            const cell1 = { id: 'cell-0', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: n/2-1 };
            const cell2 = { id: 'cell-1', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: n/2 };
            setCells([cell1, cell2]);

            // Small delay, then animate them apart
            await new Promise(resolve => setTimeout(resolve, 50));

            currentCells = [
                { id: 'cell-0', x: centerX - CELL_OFFSET / 2, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: n/2-1 },
                { id: 'cell-1', x: centerX + CELL_OFFSET / 2, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: n/2 }
            ];
            setCells(currentCells);

            await new Promise(resolve => setTimeout(resolve, 400));

            // Continue duplicating until we have n cells
            for (let i = 2; i < n; i += 2) {
                const leftmostX = currentCells[0].x;
                const rightmostX = currentCells[currentCells.length - 1].x;

                // Create new cells at the positions of the outermost cells first
                const newLeft = { id: `cell-${i}`, x: leftmostX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) - Math.floor(i/2) - 1 };
                let newCells = [newLeft, ...currentCells];

                if (i + 1 < n) {
                    const newRight = { id: `cell-${i + 1}`, x: rightmostX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) + Math.floor(i/2) + 1 };
                    newCells.push(newRight);
                }

                setCells(newCells);

                // Small delay, then animate them apart
                await new Promise(resolve => setTimeout(resolve, 50));

                newCells[0].x = leftmostX - CELL_OFFSET;
                if (i + 1 < n) {
                    newCells[newCells.length - 1].x = rightmostX + CELL_OFFSET;
                }

                currentCells = [...newCells];
                setCells(currentCells);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } else {
            // Odd n: Start with 3 cells at center, then animate them to positions
            const cell1 = { id: 'cell-0', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) - 1 };
            const cell2 = { id: 'cell-1', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) };
            const cell3 = { id: 'cell-2', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) + 1 };
            setCells([cell1, cell2, cell3]);

            // Small delay, then animate them to their positions
            await new Promise(resolve => setTimeout(resolve, 50));

            currentCells = [
                { id: 'cell-0', x: centerX - CELL_OFFSET, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) - 1 },
                { id: 'cell-1', x: centerX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) },
                { id: 'cell-2', x: centerX + CELL_OFFSET, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) + 1 }
            ];
            setCells(currentCells);

            await new Promise(resolve => setTimeout(resolve, 400));

            // Continue duplicating until we have n cells
            for (let i = 3; i < n; i += 2) {
                const leftmostX = currentCells[0].x;
                const rightmostX = currentCells[currentCells.length - 1].x;

                // Create new cells at the positions of the outermost cells first
                const newLeft = { id: `cell-${i}`, x: leftmostX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) - Math.floor((i-1)/2) - 1 };
                let newCells = [newLeft, ...currentCells];

                if (i + 1 < n) {
                    const newRight = { id: `cell-${i + 1}`, x: rightmostX, y: centerY, animate: true, needTurnOff: true, gridRow: 0, gridCol: Math.floor(n/2) + Math.floor((i-1)/2) + 2 };
                    newCells.push(newRight);
                }

                setCells(newCells);

                // Small delay, then animate them apart
                await new Promise(resolve => setTimeout(resolve, 50));

                newCells[0].x = leftmostX - CELL_OFFSET;
                if (i + 1 < n) {
                    newCells[newCells.length - 1].x = rightmostX + CELL_OFFSET;
                }

                currentCells = [...newCells];
                setCells(currentCells);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        return currentCells;
    };

    const createVerticalGrid = async (horizontalRow: CellPosition[], _centerX: number, centerY: number, n: number): Promise<void> => {

        let allCells: CellPosition[] = [...horizontalRow];

        if (n % 2 === 0) {
            // Even n: Start with 2 rows at center, then animate them apart
            const row1 = horizontalRow.map(cell => ({ ...cell, id: `r0-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) - 1 }));
            const row2 = horizontalRow.map(cell => ({ ...cell, id: `r1-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) }));

            setCells([...row1, ...row2]);

            // Small delay, then animate them apart
            await new Promise(resolve => setTimeout(resolve, 50));

            allCells = [
                ...horizontalRow.map(cell => ({ ...cell, id: `r0-${cell.id}`, y: centerY - CELL_OFFSET / 2, gridRow: Math.floor(n/2) - 1 })),
                ...horizontalRow.map(cell => ({ ...cell, id: `r1-${cell.id}`, y: centerY + CELL_OFFSET / 2, gridRow: Math.floor(n/2) }))
            ];
            setCells(allCells);
            await new Promise(resolve => setTimeout(resolve, 400));

            // Continue duplicating rows
            for (let i = 2; i < n; i += 2) {
                const topY = Math.min(...allCells.map(cell => cell.y));
                const bottomY = Math.max(...allCells.map(cell => cell.y));

                // Create new rows at the positions of the outermost rows first
                const newTopRow = horizontalRow.map(cell => ({ ...cell, id: `r${i}-${cell.id}`, y: topY, gridRow: Math.floor(n/2) - Math.floor(i/2) - 1 }));
                let newCells = [...newTopRow, ...allCells];

                if (i + 1 < n) {
                    const newBottomRow = horizontalRow.map(cell => ({ ...cell, id: `r${i + 1}-${cell.id}`, y: bottomY, gridRow: Math.floor(n/2) + Math.floor(i/2) + 1 }));
                    newCells = [...newTopRow, ...allCells, ...newBottomRow];
                }

                setCells(newCells);

                // Small delay, then animate them apart
                await new Promise(resolve => setTimeout(resolve, 50));

                // Update positions for animation
                for (let j = 0; j < horizontalRow.length; j++) {
                    newCells[j].y = topY - CELL_OFFSET;
                }
                if (i + 1 < n) {
                    const bottomRowStart = newCells.length - horizontalRow.length;
                    for (let j = bottomRowStart; j < newCells.length; j++) {
                        newCells[j].y = bottomY + CELL_OFFSET;
                    }
                }

                allCells = [...newCells];
                setCells(allCells);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } else {
            // Odd n: Start with 3 rows at center, then animate them to positions
            const row1 = horizontalRow.map(cell => ({ ...cell, id: `r0-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) - 1 }));
            const row2 = horizontalRow.map(cell => ({ ...cell, id: `r1-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) }));
            const row3 = horizontalRow.map(cell => ({ ...cell, id: `r2-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) + 1 }));

            setCells([...row1, ...row2, ...row3]);

            // Small delay, then animate them to their positions
            await new Promise(resolve => setTimeout(resolve, 50));

            allCells = [
                ...horizontalRow.map(cell => ({ ...cell, id: `r0-${cell.id}`, y: centerY - CELL_OFFSET, gridRow: Math.floor(n/2) - 1 })),
                ...horizontalRow.map(cell => ({ ...cell, id: `r1-${cell.id}`, y: centerY, gridRow: Math.floor(n/2) })),
                ...horizontalRow.map(cell => ({ ...cell, id: `r2-${cell.id}`, y: centerY + CELL_OFFSET, gridRow: Math.floor(n/2) + 1 }))
            ];
            setCells(allCells);
            await new Promise(resolve => setTimeout(resolve, 400));

            // Continue duplicating rows
            for (let i = 3; i < n; i += 2) {
                const topY = Math.min(...allCells.map(cell => cell.y));
                const bottomY = Math.max(...allCells.map(cell => cell.y));

                // Create new rows at the positions of the outermost rows first
                const newTopRow = horizontalRow.map(cell => ({ ...cell, id: `r${i}-${cell.id}`, y: topY, gridRow: Math.floor(n/2) - Math.floor((i-1)/2) - 1 }));
                let newCells = [...newTopRow, ...allCells];

                if (i + 1 < n) {
                    const newBottomRow = horizontalRow.map(cell => ({ ...cell, id: `r${i + 1}-${cell.id}`, y: bottomY, gridRow: Math.floor(n/2) + Math.floor((i-1)/2) + 2 }));
                    newCells = [...newTopRow, ...allCells, ...newBottomRow];
                }

                setCells(newCells);

                // Small delay, then animate them apart
                await new Promise(resolve => setTimeout(resolve, 50));

                // Update positions for animation
                for (let j = 0; j < horizontalRow.length; j++) {
                    newCells[j].y = topY - CELL_OFFSET;
                }
                if (i + 1 < n) {
                    const bottomRowStart = newCells.length - horizontalRow.length;
                    for (let j = bottomRowStart; j < newCells.length; j++) {
                        newCells[j].y = bottomY + CELL_OFFSET;
                    }
                }

                allCells = [...newCells];
                setCells(allCells);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

    };

    // Initialize with static cells when level changes
    useEffect(() => {
        if (!shouldPlay && currentLevel) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const initialCell = { id: `cell-0`, x: centerX, y: centerY, animate: false, needTurnOff: true, gridRow: 0, gridCol: 0 };
            setCells([initialCell]);
        }
    }, [currentLevel, shouldPlay]);

    // Handle shouldPlay trigger from parent
    useEffect(() => {
        if (shouldPlay && currentLevel) {
            createGrid();
        }
    }, [shouldPlay, createGrid, currentLevel]);

    // Handle reset trigger from parent
    useEffect(() => {
        if (shouldReset && initialScrambledState.length > 0) {
            setIsResetting(true);
            setCells([...initialScrambledState]);
            setMoves(0);
            setGamePhase('playing');
            // Reset the resetting flag after a short delay
            setTimeout(() => setIsResetting(false), 200);
        }
    }, [shouldReset, initialScrambledState]);

    // Handle new game trigger (when gameStarted becomes false)
    useEffect(() => {
        if (gameStarted === false) {
            // Reset everything to initial state
            setGamePhase('ready');
            setMoves(0);
            setInitialScrambledState([]);
            setIsResetting(false);
            // Set initial single cell
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const initialCell = { id: `cell-0`, x: centerX, y: centerY, animate: false, needTurnOff: true, gridRow: 0, gridCol: 0 };
            setCells([initialCell]);
        }
    }, [gameStarted]);

    // Handle new game with reverse animation trigger
    useEffect(() => {
        if (shouldStartNewGame && gamePhase === 'won') {
            reverseToCenter();
        }
    }, [shouldStartNewGame, gamePhase, reverseToCenter]);

    // Handle play button click - start grid creation when gamePhase changes to animation
    useEffect(() => {
        if (gamePhase === 'animation' && currentLevel && cells.length === 1) {
            createGrid();
        }
    }, [gamePhase, currentLevel, cells.length, createGrid]);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {cells.map((cell) => (
                <GlassEffect
                    key={cell.id}
                    width={CELL_WIDTH}
                    height={CELL_WIDTH}
                    initialX={`${cell.x}px`}
                    initialY={`${cell.y}px`}
                    animate={cell.animate}
                    needTurnOff={cell.needTurnOff}
                    onCellClick={() => handleCellClick(cell.id)}
                    gameReady={gamePhase === 'playing' && !cell.animate}
                    showPlayButton={cells.length === 1 && gamePhase === 'ready' && initialScrambledState.length === 0 && !hasEverStarted}
                    hideGlow={gamePhase === 'animation' || gamePhase === 'scrambling' || gamePhase === 'won' || gamePhase === 'reversing'}
                    fastTransition={gamePhase === 'scrambling' || isResetting}
                    fadeOut={gamePhase === 'fadingOut' && cell.shouldFadeOut}
                    gamePhase={gamePhase}
                />
            ))}
        </div>
    )
}

export default Board