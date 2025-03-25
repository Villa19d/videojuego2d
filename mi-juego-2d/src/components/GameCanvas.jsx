import React, { useEffect, useRef, useState } from 'react';
import AsteroidesImg from '../assets/images/Asteroide.png'; // Importación directa
import AstronautaImg from '../assets/images/astronauta.png';
import LaserCursor from '../assets/images/laser-cursor.png';
import SpaceBg from '../assets/images/bg.avif';
import BackgroundMusic from '../assets/audio/Background.mp3';
import LaserSound from '../assets/audio/laser.mp3';

const GameCanvas = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const asteroidsRef = useRef([]);
    const assetsLoaded = useRef(false);
    const animationFrameId = useRef(null);
    const asteroidIntervalId = useRef(null);
    const asteroidSpawnRate = useRef(1000); // Empieza generando cada 1 segundo
    
    const config = {
      canvasWidth: 800,
      canvasHeight: 600,
      astronautSize: 60,
      asteroidMinSize: 30,
      asteroidMaxSize: 60
    };

    const audioRef = useRef({
        bgMusic: new Audio(BackgroundMusic),
        laser: new Audio(LaserSound)
      });

   
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return; // Protección adicional

      // Agrega esto al inicio del useEffect (después de obtener el contexto)
      const startMusic = () => {
            try {
            audioRef.current.bgMusic.volume = 0.3;
            audioRef.current.bgMusic.loop = true;
            // Intenta reproducir y si falla por políticas de autoplay, muestra un botón
            const playPromise = audioRef.current.bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                // Crea un botón para iniciar la música
                const musicButton = document.createElement('button');
                musicButton.textContent = 'Activar música';
                musicButton.style.position = 'fixed';
                musicButton.style.bottom = '20px';
                musicButton.style.right = '20px';
                musicButton.style.zIndex = '1000';
                musicButton.onclick = () => {
                    audioRef.current.bgMusic.play();
                    musicButton.remove();
                };
                document.body.appendChild(musicButton);
                });
            }
            } catch (e) {
            console.error("Error con audio:", e);
            }
      };
        
  
      const images = {
        asteroid: new Image(),
        astronaut: new Image(),
        cursor: new Image()
      };
  
      let loadedImages = 0;
      const totalImages = Object.keys(images).length;
  
      const checkAssetsLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          assetsLoaded.current = true;
        }
      };
  
      images.asteroid.onload = checkAssetsLoaded;
      images.asteroid.src = AsteroidesImg;
      
      images.astronaut.onload = checkAssetsLoaded;
      images.astronaut.src = AstronautaImg;
      
      images.cursor.onload = checkAssetsLoaded;
      images.cursor.src = LaserCursor;

       // Llama a la función después de cargar los assets
       images.astronaut.onload = () => {
        checkAssetsLoaded();
        startMusic(); // Inicia la música cuando todo esté listo
       };

      const ctx = canvas.getContext('2d');
      canvas.width = config.canvasWidth;
      canvas.height = config.canvasHeight;
  
      const astronaut = {
        x: config.canvasWidth / 2 - config.astronautSize / 2,
        y: config.canvasHeight / 2 - config.astronautSize / 2,
        size: config.astronautSize
      };
  
      const laser = {
        active: false,
        x: 0,
        y: 0,
        angle: 0,
        length: config.canvasWidth * 2
      };

      
  
   
       const generateAsteroid = () => {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        // Posición inicial según el borde de aparición
        switch(side) {
          case 0: x = Math.random() * config.canvasWidth; y = -50; break;       // Arriba
          case 1: x = config.canvasWidth + 50; y = Math.random() * config.canvasHeight; break;  // Derecha
          case 2: x = Math.random() * config.canvasWidth; y = config.canvasHeight + 50; break;  // Abajo
          case 3: x = -50; y = Math.random() * config.canvasHeight; break;      // Izquierda
        }
      
        // Cálculo de tamaño y velocidad (ajustado por dificultad)
        const size = config.asteroidMinSize + Math.random() * (config.asteroidMaxSize - config.asteroidMinSize);
        const baseSpeed = 1 + (score / 500); // Velocidad aumenta con el puntaje
        const speedVariation = 0.5 + Math.random() * 1.5; // Variación aleatoria
      
        return {
          x,
          y,
          size,
          speedX: (config.canvasWidth/2 - x) / config.canvasWidth * baseSpeed * speedVariation,
          speedY: (config.canvasHeight/2 - y) / config.canvasHeight * baseSpeed * speedVariation
        };
      };

      const spawnAsteroid = () => {
        if (!gameOver) {
          asteroidsRef.current = [...asteroidsRef.current, generateAsteroid()];
          const nextDelay = Math.max(200, 1000 - (score * 0.1)); // Ajuste fino basado en puntaje
          setTimeout(spawnAsteroid, nextDelay);
        }
      }; spawnAsteroid();
      
      let floatOffset = 0;
      let floatDirection = 1;
      const drawAstronaut = () => {
        // Animación de flotar
        floatOffset += 0.05 * floatDirection;
        if (Math.abs(floatOffset) > 3) floatDirection *= -1;

        if (assetsLoaded.current) {
            ctx.drawImage(
            images.astronaut,
            astronaut.x,
            astronaut.y + floatOffset, // Añade el offset vertical
            astronaut.size,
            astronaut.size
            );
        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(astronaut.x, astronaut.y + floatOffset, astronaut.size, astronaut.size);
        }
      };
  
      const drawLaser = () => {
        if (!laser.active) return;
        
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(laser.x, laser.y);
        ctx.lineTo(
          laser.x + Math.cos(laser.angle) * laser.length,
          laser.y + Math.sin(laser.angle) * laser.length
        );
        ctx.stroke();
        ctx.restore();
      };
  
      const drawAsteroids = () => {
        asteroidsRef.current.forEach(asteroid => {
          if (assetsLoaded.current) {
            ctx.drawImage(
              images.asteroid,
              asteroid.x,
              asteroid.y,
              asteroid.size,
              asteroid.size
            );
          } else {
            ctx.fillStyle = 'gray';
            ctx.beginPath();
            ctx.arc(
              asteroid.x + asteroid.size/2,
              asteroid.y + asteroid.size/2,
              asteroid.size/2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        });
      };
  
      const checkCollisions = () => {
        asteroidsRef.current.forEach(asteroid => {
          const dx = (astronaut.x + astronaut.size/2) - (asteroid.x + asteroid.size/2);
          const dy = (astronaut.y + astronaut.size/2) - (asteroid.y + asteroid.size/2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < (astronaut.size/2 + asteroid.size/2)) {
            setGameOver(true);
            return;
          }
        });
  
        if (laser.active) {
          asteroidsRef.current = asteroidsRef.current.filter(asteroid => {
            const asteroidCenter = {
              x: asteroid.x + asteroid.size/2,
              y: asteroid.y + asteroid.size/2
            };
            
            const distance = pointToLineDistance(
              laser.x, laser.y,
              laser.x + Math.cos(laser.angle) * laser.length,
              laser.y + Math.sin(laser.angle) * laser.length,
              asteroidCenter.x, asteroidCenter.y
            );
            
            if (distance < asteroid.size/2) {
              setScore(prev => prev + 10);
              return false;
            }
            return true;
          });
        }
      };
  
      const pointToLineDistance = (x1, y1, x2, y2, px, py) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
  
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;
  
        let xx, yy;
  
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
  
        return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
      };
  
      const handleClick = (e) => {
        if (gameOver) return;
         // Sonido de disparo
         audioRef.current.laser.currentTime = 0; // Rebobina si ya estaba sonando
         audioRef.current.laser.play();
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        laser.active = true;
        laser.x = astronaut.x + astronaut.size/2;
        laser.y = astronaut.y + astronaut.size/2;
        laser.angle = Math.atan2(
          mouseY - laser.y,
          mouseX - laser.x
        );
        
        setTimeout(() => {
          laser.active = false;
        }, 100);
      };

      const loadCursor = () => {
        const cursorImg = new Image();
        cursorImg.src = LaserCursor;
        return cursorImg;
      };
      const cursorImg = loadCursor();

      const handleMouseMove = () => {
        canvas.style.cursor = `url("../assets/images/laser-cursor.png")`;
      };

      // Para restaurar el cursor
      const handleMouseLeave = () => {
        canvas.style.cursor = 'default';
      };
  
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      
      
      const gameLoop = (timestamp) => {
        if (gameOver) return;

        let lastDifficultyUpdate = 0;
        const difficultyIncreaseInterval = 30000; // 30 segundos
        // Aumentar dificultad cada X tiempo
       if(timestamp - lastDifficultyUpdate > difficultyIncreaseInterval){
        asteroidSpawnRate.current = Math.max(200, asteroidSpawnRate.current - 100);
        lastDifficultyUpdate = timestamp;}
        
        ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
        
        asteroidsRef.current = asteroidsRef.current.map(asteroid => ({
          ...asteroid,
          x: asteroid.x + asteroid.speedX,
          y: asteroid.y + asteroid.speedY
        })).filter(asteroid => 
          asteroid.x > -asteroid.size && 
          asteroid.x < config.canvasWidth + asteroid.size &&
          asteroid.y > -asteroid.size && 
          asteroid.y < config.canvasHeight + asteroid.size
        );
        
        drawAstronaut();
        drawAsteroids();
        drawLaser();
        checkCollisions();
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
      };
  
      animationFrameId.current = requestAnimationFrame(gameLoop);
      asteroidIntervalId.current = setInterval(() => {
        if (!gameOver) {
          asteroidsRef.current = [...asteroidsRef.current, generateAsteroid()];
        }
      }, 1000);
  
      return () => {
         // Limpia audio
         audioRef.current.bgMusic.pause();
         audioRef.current.bgMusic.currentTime = 0;

         //Limpia mouse
        canvas.removeEventListener('mouseleave', handleMouseLeave);


        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        if (asteroidIntervalId.current) {
          clearInterval(asteroidIntervalId.current);
        }
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('mousemove', handleMouseMove);
      };
    }, [gameOver]);
  
    if (gameOver) {
      return (
        <div style={{
      textAlign: 'center',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)`,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url(${SpaceBg}) center/cover no-repeat`,
        opacity: 0.5,
        zIndex: -1
      }} />
          <h1 style={{ fontSize: '3rem' }}>¡GAME OVER!</h1>
          <h2 style={{ fontSize: '2rem' }}>Puntuación final: {score}</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              margin: '20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Jugar de nuevo
          </button>
        </div>
      );
    }
  
    return (
      <div style={{ textAlign: 'center' }}>
        <canvas 
          ref={canvasRef} 
          className="canvas-cursor"
          style={{
            background: `url(${SpaceBg}) center/cover no-repeat`,
            display: 'block',
            margin: '0 auto',
            border: '2px solid #444',
            cursor: `url("../assets/images/laser-cursor.png"), auto` // Cursor por defecto
        }}
        onMouseEnter={() => {
            canvasRef.current.style.cursor = `url("../assets/images/laser-cursor.png"), auto`;
          }}
        />
        <div style={{ 
          color: 'white',
          backgroundColor: 'black',
          padding: '10px',
          fontSize: '1.5rem'
        }}>
          Puntuación: {score} | Destruye los asteroides antes que te alcancen
        </div>
      </div>
    );
};

export default GameCanvas;