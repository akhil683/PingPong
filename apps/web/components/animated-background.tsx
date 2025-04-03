"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create dust sprites (like the soot sprites from Spirited Away)
    const dustSprites: DustSprite[] = [];

    // Create grass blades
    const grassBlades: GrassBlade[] = [];

    // Create floating elements (leaves, seeds, etc)
    const floatingElements: FloatingElement[] = [];

    // Colors
    const colors = {
      background: "#e6f7ff", // Light sky blue
      dustSprite: "#333333", // Dark gray for soot sprites
      grass: ["#7ab317", "#86c12a", "#5d8c0b", "#9ed84e"], // Various greens
      elements: ["#f9d6ac", "#f8b878", "#ffedd1", "#ffffff", "#e2f0cb"], // Warm colors for floating elements
    };

    // Create dust sprites
    // for (let i = 0; i < ; i++) {
    //   const x = Math.random() * canvas.width;
    //   const y = Math.random() * canvas.height;
    //   const size = 3 + Math.random() * 8;
    //   const speed = 0.2 + Math.random() * 0.8;
    //   const angle = Math.random() * Math.PI * 2;
    //
    //   dustSprites.push({
    //     x,
    //     y,
    //     size,
    //     speed,
    //     angle,
    //     eyeBlinkTime: Math.random() * 100,
    //     legPhase: Math.random() * Math.PI * 2,
    //   });
    // }

    // Create grass blades at the bottom
    const grassCount = Math.ceil(canvas.width / 15);
    for (let i = 0; i < grassCount; i++) {
      const x = i * 15 + Math.random() * 10;
      const height = 30 + Math.random() * 70;
      const width = 5 + Math.random() * 10;
      const colorIndex = Math.floor(Math.random() * colors.grass.length);

      grassBlades.push({
        x,
        height,
        width,
        color: colors.grass[colorIndex] as string,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // Create floating elements
    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.5 ? "leaf" : "seed";
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size =
        type === "leaf" ? 5 + Math.random() * 10 : 2 + Math.random() * 5;
      const speed = 0.3 + Math.random() * 1;
      const angle = Math.random() * Math.PI * 2;
      const rotationSpeed = (Math.random() - 0.5) * 0.02;
      const colorIndex = Math.floor(Math.random() * colors.elements.length);

      floatingElements.push({
        type,
        x,
        y,
        size,
        speed,
        angle,
        rotation: 0,
        rotationSpeed,
        color: colors.elements[colorIndex] as string,
      });
    }

    // Animation loop
    let animationId: number;

    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colors.background);
      gradient.addColorStop(1, "#ffffff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      drawClouds(ctx, canvas.width, canvas.height);

      // Draw and update floating elements
      floatingElements.forEach((element) => {
        // Update position
        element.x += Math.cos(element.angle) * element.speed;
        element.y += Math.sin(element.angle) * element.speed;

        // Update rotation
        element.rotation += element.rotationSpeed;

        // Bounce off edges
        if (element.x < 0 || element.x > canvas.width) {
          element.angle = Math.PI - element.angle;
        }
        if (element.y < 0 || element.y > canvas.height) {
          element.angle = -element.angle;
        }

        // Draw element
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation);

        if (element.type === "leaf") {
          drawLeaf(ctx, 0, 0, element.size, element.color);
        } else {
          drawSeed(ctx, 0, 0, element.size, element.color);
        }

        ctx.restore();
      });

      // Draw and update dust sprites
      dustSprites.forEach((sprite) => {
        // Update position with slight wobble
        sprite.x +=
          Math.cos(sprite.angle) * sprite.speed +
          Math.sin(Date.now() * 0.001 + sprite.legPhase) * 0.3;
        sprite.y += Math.sin(sprite.angle) * sprite.speed;

        // Bounce off edges
        if (sprite.x < 0 || sprite.x > canvas.width) {
          sprite.angle = Math.PI - sprite.angle;
        }
        if (sprite.y < 0 || sprite.y > canvas.height) {
          sprite.angle = -sprite.angle;
        }

        // Update eye blink
        sprite.eyeBlinkTime--;
        if (sprite.eyeBlinkTime <= 0) {
          sprite.eyeBlinkTime = 100 + Math.random() * 200;
        }

        // Draw sprite
        drawDustSprite(
          ctx,
          sprite.x,
          sprite.y,
          sprite.size,
          sprite.eyeBlinkTime < 10,
          sprite.legPhase,
        );

        // Update leg phase
        sprite.legPhase += 0.1;
      });

      // Draw grass at the bottom
      grassBlades.forEach((blade) => {
        // Update sway
        blade.swayPhase += blade.swaySpeed;

        // Draw grass blade
        drawGrassBlade(
          ctx,
          blade.x,
          canvas.height,
          blade.height,
          blade.width,
          blade.color,
          blade.swayPhase,
        );
      });

      animationId = requestAnimationFrame(animate);
    };

    // Helper function to draw a dust sprite (soot sprite)
    function drawDustSprite(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      blinking: boolean,
      legPhase: number,
    ) {
      // Body
      ctx.fillStyle = colors.dustSprite;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "white";
      const eyeSize = size * 0.3;
      const eyeOffset = size * 0.3;

      if (!blinking) {
        ctx.beginPath();
        ctx.arc(x - eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = "black";
        const pupilSize = eyeSize * 0.5;
        ctx.beginPath();
        ctx.arc(x - eyeOffset, y - eyeOffset, pupilSize, 0, Math.PI * 2);
        ctx.arc(x + eyeOffset, y - eyeOffset, pupilSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Closed eyes
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - eyeOffset - eyeSize, y - eyeOffset);
        ctx.lineTo(x - eyeOffset + eyeSize, y - eyeOffset);
        ctx.moveTo(x + eyeOffset - eyeSize, y - eyeOffset);
        ctx.lineTo(x + eyeOffset + eyeSize, y - eyeOffset);
        ctx.stroke();
      }

      // Legs
      ctx.strokeStyle = colors.dustSprite;
      ctx.lineWidth = size * 0.2;

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + legPhase;
        const legLength = size * 0.8;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + Math.cos(angle) * legLength,
          y + Math.sin(angle) * legLength,
        );
        ctx.stroke();
      }
    }

    // Helper function to draw a grass blade
    function drawGrassBlade(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      height: number,
      width: number,
      color: string,
      swayPhase: number,
    ) {
      const sway = Math.sin(swayPhase) * (width * 0.8);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + sway,
        y - height * 0.6,
        x + sway * 1.5,
        y - height,
      );
      ctx.quadraticCurveTo(
        x + sway * 1.5 + width * 0.3,
        y - height + width * 0.3,
        x + sway * 1.5 + width * 0.5,
        y - height,
      );
      ctx.quadraticCurveTo(x + width + sway, y - height * 0.6, x + width, y);
      ctx.closePath();
      ctx.fill();
    }

    // Helper function to draw a leaf
    function drawLeaf(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
    ) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = "#00000022";
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.5);
      ctx.lineTo(x, y + size * 1.5);
      ctx.stroke();

      // Side veins
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const yOffset = i * size * 0.4;
        const xLength = size * 0.8 * (1 - Math.abs(i) / 4);

        ctx.beginPath();
        ctx.moveTo(x, y + yOffset);
        ctx.lineTo(x + xLength, y + yOffset + size * 0.2 * Math.sign(i));
        ctx.stroke();
      }
    }

    // Helper function to draw a seed
    function drawSeed(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
    ) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.5, size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Seed "wings"
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x + size * 2, y - size * 0.5, x, y + size);
      ctx.quadraticCurveTo(x - size * 2, y - size * 0.5, x, y - size);
      ctx.closePath();
      ctx.fill();
    }

    // Helper function to draw clouds
    function drawClouds(
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) {
      const time = Date.now() * 0.0001;

      // Draw a few cloud clusters
      for (let i = 0; i < 5; i++) {
        const x = (((i * width) / 5 + time * 20) % (width * 1.2)) - width * 0.1;
        const y = height * (0.1 + i * 0.05);
        const scale = 0.5 + i * 0.1;

        drawCloudCluster(ctx, x, y, scale);
      }
    }

    // Helper function to draw a cloud cluster
    function drawCloudCluster(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
    ) {
      ctx.fillStyle = "#ffffff";

      // Draw several overlapping circles to form a cloud
      const baseSize = 30 * scale;

      ctx.beginPath();
      ctx.arc(x, y, baseSize, 0, Math.PI * 2);
      ctx.arc(x + baseSize * 1.2, y, baseSize * 0.9, 0, Math.PI * 2);
      ctx.arc(
        x + baseSize * 2,
        y + baseSize * 0.2,
        baseSize * 0.8,
        0,
        Math.PI * 2,
      );
      ctx.arc(
        x + baseSize * 0.5,
        y - baseSize * 0.4,
        baseSize * 0.7,
        0,
        Math.PI * 2,
      );
      ctx.arc(
        x + baseSize * 1.5,
        y - baseSize * 0.3,
        baseSize * 0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}

interface DustSprite {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  eyeBlinkTime: number;
  legPhase: number;
}

interface GrassBlade {
  x: number;
  height: number;
  width: number;
  color: string;
  swayPhase: number;
  swaySpeed: number;
}

interface FloatingElement {
  type: "leaf" | "seed";
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}
