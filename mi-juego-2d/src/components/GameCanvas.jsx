import React, { useEffect, useRef, useState } from 'react';
import AsteroidesImg from '../assets/images/Asteroide.png'; // Importación directa

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const asteroidsRef = useRef([]);
  const asteroidImgRef = useRef(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configuración inicial del canvas
    canvas.width = 800;
    canvas.height = 600;

    // Cargar imagen del asteroide
    asteroidImgRef.current.src = AsteroidesImg; // Usa la importación
    asteroidImgRef.current.onload = () => {
      console.log('Imagen cargada correctamente');
    };
    asteroidImgRef.current.onerror = () => {
      console.error('Error al cargar la imagen');
    };

    // Función para generar asteroides
    const generateAsteroid = () => {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch(side) {
        case 0: x = Math.random() * canvas.width; y = -40; break;
        case 1: x = canvas.width + 40; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 40; break;
        case 3: x = -40; y = Math.random() * canvas.height; break;
      }

      return {
        x,
        y,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        size: 60
      };
    };

    // Bucle principal del juego
    let animationFrameId;
    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Solo dibujar si la imagen está cargada
      if (asteroidImgRef.current.complete && asteroidImgRef.current.naturalWidth > 0) {
        asteroidsRef.current.forEach(asteroid => {
          ctx.drawImage(
            asteroidImgRef.current, 
            asteroid.x, 
            asteroid.y, 
            asteroid.size, 
            asteroid.size
          );
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Iniciar el bucle del juego
    gameLoop();

    // Generar asteroides cada segundo
    const asteroidInterval = setInterval(() => {
      const newAsteroid = generateAsteroid();
      asteroidsRef.current = [...asteroidsRef.current, newAsteroid];
      setAsteroids(asteroidsRef.current);
    }, 1000);

    // Mover asteroides
    const moveInterval = setInterval(() => {
      asteroidsRef.current = asteroidsRef.current.map(asteroid => ({
        ...asteroid,
        x: asteroid.x + asteroid.speedX,
        y: asteroid.y + asteroid.speedY
      })).filter(asteroid => 
        asteroid.x > -asteroid.size && 
        asteroid.x < canvas.width + asteroid.size &&
        asteroid.y > -asteroid.size && 
        asteroid.y < canvas.height + asteroid.size
      );
      setAsteroids(asteroidsRef.current);
    }, 16);

    // Manejar clics
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hitIndex = asteroidsRef.current.findIndex(asteroid => 
        mouseX >= asteroid.x && 
        mouseX <= asteroid.x + asteroid.size &&
        mouseY >= asteroid.y && 
        mouseY <= asteroid.y + asteroid.size
      );

      if (hitIndex !== -1) {
        asteroidsRef.current.splice(hitIndex, 1);
        setAsteroids([...asteroidsRef.current]);
        setScore(prev => prev + 10);
      }
    };

    canvas.addEventListener('click', handleClick);

    // Limpieza
    return () => {
      clearInterval(asteroidInterval);
      clearInterval(moveInterval);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        style={{ 
          background: '#000', 
          display: 'block', 
          margin: '0 auto',
          border: '1px solid white'
        }}
      />
      <div style={{ 
        color: 'white', 
        textAlign: 'center', 
        fontSize: '24px',
        marginTop: '10px'
      }}>
        Puntuación: {score}
      </div>
    </div>
  );
};

export default GameCanvas;