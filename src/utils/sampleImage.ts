/**
 * Generates an initial sample passport photo as a high-res Data URL
 * so the application is immediately interactive and functional on first load.
 */
export function createSamplePortraitDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean studio neutral light grey background (compliant with passport standards)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#f1f5f9');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft studio background glow
  const glow = ctx.createRadialGradient(350, 400, 50, 350, 400, 350);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shoulders & Clothes (Navy blue smart casual blazer / shirt)
  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(350, 850, 260, 220, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(310, 680);
  ctx.lineTo(350, 750);
  ctx.lineTo(390, 680);
  ctx.lineTo(350, 700);
  ctx.closePath();
  ctx.fill();

  // Tie / Collar detail
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(344, 735);
  ctx.lineTo(356, 735);
  ctx.lineTo(353, 830);
  ctx.lineTo(347, 830);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#f3c49e';
  ctx.beginPath();
  ctx.roundRect(315, 520, 70, 150, [0, 0, 20, 20]);
  ctx.fill();

  // Neck shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(350, 545, 45, 18, 0, 0, Math.PI);
  ctx.fill();

  // Head / Face
  ctx.fillStyle = '#fad5b8';
  ctx.beginPath();
  ctx.ellipse(350, 430, 115, 145, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.ellipse(350, 360, 125, 110, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(230, 370);
  ctx.quadraticCurveTo(270, 280, 350, 290);
  ctx.quadraticCurveTo(430, 280, 470, 370);
  ctx.quadraticCurveTo(420, 320, 350, 330);
  ctx.quadraticCurveTo(280, 320, 230, 370);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#f0be97';
  ctx.beginPath();
  ctx.ellipse(230, 435, 14, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(470, 435, 14, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.fillStyle = '#3d342f';
  ctx.beginPath();
  ctx.roundRect(280, 385, 45, 7, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(375, 385, 45, 7, 3);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(302, 410, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(398, 410, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris
  ctx.fillStyle = '#3b4252';
  ctx.beginPath();
  ctx.arc(302, 410, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(398, 410, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupil & light reflection
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(302, 410, 4, 0, Math.PI * 2);
  ctx.arc(398, 410, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(305, 408, 2.5, 0, Math.PI * 2);
  ctx.arc(401, 408, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.strokeStyle = '#d79b76';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(350, 410);
  ctx.lineTo(346, 455);
  ctx.quadraticCurveTo(350, 463, 356, 460);
  ctx.stroke();

  // Lips / Neutral expression (passport compliant)
  ctx.fillStyle = '#c76b62';
  ctx.beginPath();
  ctx.ellipse(350, 498, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a64f47';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(326, 498);
  ctx.lineTo(374, 498);
  ctx.stroke();

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}
