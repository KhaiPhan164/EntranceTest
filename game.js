function Game() {
    const [points, setPoints] = React.useState(5);
    const [time, setTime] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [gamePoints, setGamePoints] = React.useState([]);
    const [timer, setTimer] = React.useState(null);
    const [currentNumber, setCurrentNumber] = React.useState(1);
    const [gameStatus, setGameStatus] = React.useState(null);
    const [clickedPoints, setClickedPoints] = React.useState(new Set());
    const [autoPlay, setAutoPlay] = React.useState(false);
    const [autoPlayInterval, setAutoPlayInterval] = React.useState(null);

    const generateRandomPoints = () => {
        const newPoints = [];
        const pointSize = 50;
        const padding = 5; // Khoảng cách tối thiểu giữa các điểm
        const maxAttempts = 100; // Số lần thử tối đa cho mỗi điểm

        const checkCollision = (x, y, points) => {
            const radius = pointSize / 2 + padding;
            return points.some(point => {
                const dx = point.x - x;
                const dy = point.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < radius * 2;
            });
        };

        for (let i = 0; i < points; i++) {
            let attempts = 0;
            let x, y;
            let foundValidPosition = false;

            // Thử tìm vị trí không chồng lên với các điểm khác
            while (attempts < maxAttempts && !foundValidPosition) {
                x = pointSize + Math.random() * (400 - 2 * pointSize);
                y = pointSize + Math.random() * (400 - 2 * pointSize);

                if (!checkCollision(x, y, newPoints)) {
                    foundValidPosition = true;
                }
                attempts++;
            }

            // Nếu không tìm được vị trí sau nhiều lần thử, đặt điểm ở vị trí ngẫu nhiên
            if (!foundValidPosition) {
                x = pointSize + Math.random() * (400 - 2 * pointSize);
                y = pointSize + Math.random() * (400 - 2 * pointSize);
            }

            newPoints.push({
                id: i + 1,
                x: x,
                y: y,
                clickTime: null
            });
        }
        
        setGamePoints(newPoints);
        setCurrentNumber(1);
        setGameStatus(null);
        setClickedPoints(new Set());
    };

    const handlePlay = () => {
        setIsPlaying(true);
        generateRandomPoints();
        const newTimer = setInterval(() => {
            setTime(prevTime => prevTime + 0.1);
        }, 100);
        setTimer(newTimer);
    };

    const handlePointClick = (pointId) => {
        if (gameStatus || clickedPoints.has(pointId)) return;

        if (pointId === currentNumber) {
            const newClickedPoints = new Set(clickedPoints);
            newClickedPoints.add(pointId);
            setClickedPoints(newClickedPoints);

            setGamePoints(prevPoints =>
                prevPoints.map(point =>
                    point.id === pointId
                        ? { ...point, clickTime: time.toFixed(1) }
                        : point
                )
            );

            if (currentNumber === points) {
                setGameStatus('win');
                if (timer) {
                    clearInterval(timer);
                }
                setAutoPlay(false);
            } else {
                setCurrentNumber(prev => prev + 1);
            }
        } else {
            setGameStatus('lose');
            if (timer) {
                clearInterval(timer);
            }
            setAutoPlay(false);
        }
    };

    const handleRestart = () => {
        setTime(0);
        generateRandomPoints();
        setGameStatus(null);
        setAutoPlay(false);
        if (timer) {
            clearInterval(timer);
        }
        const newTimer = setInterval(() => {
            setTime(prevTime => prevTime + 0.1);
        }, 100);
        setTimer(newTimer);
    };

    const toggleAutoPlay = () => {
        setAutoPlay(!autoPlay);
    };

    // Thêm useEffect để xử lý Auto Play
    React.useEffect(() => {
        let autoPlayTimer;
        if (autoPlay && !gameStatus) {
            autoPlayTimer = setInterval(() => {
                handlePointClick(currentNumber);
            }, 1500);
        }
        return () => {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
            }
        };
    }, [autoPlay, currentNumber, gameStatus]);

    React.useEffect(() => {
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, []);

    return (
        <div className="game-container">
            <h2 className={gameStatus}>
                {gameStatus === 'win' ? 'ALL CLEARED' :
                 gameStatus === 'lose' ? 'GAME OVER' :
                 'LET\'S PLAY'}
            </h2>
            <div className="input-group">
                <label>Points:</label>
                <input 
                    type="text" 
                    value={points}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Chỉ cho phép nhập số
                        if (/^\d*$/.test(value)) {
                            const numValue = value === '' ? 1 : parseInt(value);
                            if (numValue >= 1) {
                                setPoints(numValue);
                            }
                        }
                    }}
                    onBlur={(e) => {
                        // Khi mất focus, đảm bảo giá trị hợp lệ
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 1) {
                            setPoints(1);
                        }
                    }}
                />
            </div>
            <div className="input-group">
                <label>Time:</label>
                <span>{time.toFixed(1)}s</span>
            </div>
            <div className="game-controls">
                {!isPlaying ? (
                    <button onClick={handlePlay}>Play</button>
                ) : (
                    <div>
                        <button onClick={handleRestart}>Restart</button>
                        {!gameStatus && (
                            <button onClick={toggleAutoPlay}>
                                Auto Play {autoPlay ? 'OFF' : 'ON'}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="game-board">
                {gamePoints.map(point => (
                    <div
                        key={point.id}
                        className={`point ${clickedPoints.has(point.id) ? 'clicked' : ''}`}
                        style={{
                            left: `${point.x}px`,
                            top: `${point.y}px`,
                            transition: 'all 1.5s ease'
                        }}
                        onClick={() => handlePointClick(point.id)}
                    >
                        <div className="number">{point.id}</div>
                        {point.clickTime && <div className="time">{point.clickTime}s</div>}
                    </div>
                ))}
            </div>
            <div className="next-number">Next: {currentNumber}</div>
        </div>
    );
}

ReactDOM.render(<Game />, document.getElementById('root')); 