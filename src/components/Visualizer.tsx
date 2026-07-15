import { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  genre: string;
}

export default function Visualizer({ analyser, isPlaying, genre }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Determine theme colors based on genre
  const getThemeColors = (g: string) => {
    switch (g.toLowerCase()) {
      case 'synthwave':
        return { primary: '#ff007f', secondary: '#00f0ff', background: '#120c1f' }; // Neon pink & cyan
      case 'lo-fi':
        return { primary: '#f59e0b', secondary: '#ec4899', background: '#181216' }; // Warm amber & soft pink
      case 'cyberpunk / techno':
        return { primary: '#10b981', secondary: '#f59e0b', background: '#09100d' }; // Poison green & yellow
      case 'ambient / space':
        return { primary: '#3b82f6', secondary: '#8b5cf6', background: '#0b0c16' }; // Deep blue & purple
      case 'deep house':
        return { primary: '#1db954', secondary: '#10b981', background: '#0e1712' }; // Spotify green & emerald
      default:
        return { primary: '#1db954', secondary: '#10b981', background: '#121212' }; // Standard dark & green
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getThemeColors(genre);

    // Make canvas responsive to its container
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 300) * window.devicePixelRatio;
      canvas.height = (rect?.height || 80) * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Audio frequency buffer
    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    if (analyser) {
      analyser.fftSize = 128;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    // Procedural fake waves for fallback / offline when real analyser is unavailable
    const wavePoints: { x: number; y: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 40; i++) {
      wavePoints.push({
        x: i * 10,
        y: 0,
        speed: 0.05 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let fakeTimer = 0;

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear with slight alpha to create a motion blur trail
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines in background for music style
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 15;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyser && isPlaying) {
        // --- REAL-TIME FFT SPECTRUM VISUALIZER ---
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 0.8;
        const barSpacing = (width / bufferLength) * 0.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          // Gradient for each bar
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, colors.secondary);
          gradient.addColorStop(1, colors.primary);

          ctx.fillStyle = gradient;
          
          // Rounded bars
          const roundedHeight = Math.max(barHeight, 2);
          const yPos = height - roundedHeight;
          const radius = Math.min(barWidth / 2, 3);

          ctx.beginPath();
          ctx.moveTo(x + radius, yPos);
          ctx.lineTo(x + barWidth - radius, yPos);
          ctx.quadraticCurveTo(x + barWidth, yPos, x + barWidth, yPos + radius);
          ctx.lineTo(x + barWidth, height);
          ctx.lineTo(x, height);
          ctx.lineTo(x, yPos + radius);
          ctx.quadraticCurveTo(x, yPos, x + radius, yPos);
          ctx.closePath();
          ctx.fill();

          x += barWidth + barSpacing;
        }
      } else {
        // --- PROCEDURAL FALLBACK VISUALIZER ---
        // Smooth dancing waveforms when playing or flatlined when paused
        if (isPlaying) {
          fakeTimer += 0.1;
        }

        const barCount = 36;
        const barWidth = (width / barCount) * 0.7;
        const barSpacing = (width / barCount) * 0.3;
        
        for (let i = 0; i < barCount; i++) {
          let amplitude = 0;
          if (isPlaying) {
            // Generate elegant compound sine waves for music-like dancing bars
            const freq1 = Math.sin(i * 0.3 + fakeTimer * 0.8) * 0.5 + 0.5;
            const freq2 = Math.cos(i * 0.15 - fakeTimer * 1.4) * 0.4 + 0.6;
            const noise = Math.sin(i * 0.7 + fakeTimer * 2.1) * 0.1;
            amplitude = (freq1 * 0.6 + freq2 * 0.3 + noise * 0.1) * height * 0.7;
            
            // Add bounce on edges
            const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
            amplitude = amplitude * (0.3 + centerFactor * 0.7);
          } else {
            // Idle state: flat line with tiny random thermal jitters
            amplitude = 2 + Math.sin(i * 0.5) * 0.5;
          }

          const gradient = ctx.createLinearGradient(0, height, 0, height - amplitude);
          gradient.addColorStop(0, colors.secondary);
          gradient.addColorStop(1, colors.primary);
          ctx.fillStyle = gradient;

          const x = i * (barWidth + barSpacing) + barSpacing;
          const yPos = height - amplitude;
          const radius = Math.min(barWidth / 2, 3);

          ctx.beginPath();
          ctx.moveTo(x + radius, yPos);
          ctx.lineTo(x + barWidth - radius, yPos);
          ctx.quadraticCurveTo(x + barWidth, yPos, x + barWidth, yPos + radius);
          ctx.lineTo(x + barWidth, height);
          ctx.lineTo(x, height);
          ctx.lineTo(x, yPos + radius);
          ctx.quadraticCurveTo(x, yPos, x + radius, yPos);
          ctx.closePath();
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [analyser, isPlaying, genre]);

  return (
    <div id="visualizer-container" className="w-full h-full relative overflow-hidden rounded-md border border-white/5">
      <canvas ref={canvasRef} className="w-full h-full block" id="visualizer-canvas" />
    </div>
  );
}
