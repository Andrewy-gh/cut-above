import hero from '../assets/images/hero.webp';

const containerStyle = {
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: `url(${hero}) center/cover no-repeat`,
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background:
    'linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 85%, rgba(0,0,0,0.50) 100%)',
};

const contentStyle = {
  marginInline: 'auto',
  paddingBlock: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  mb: '1.5rem',
  position: 'relative',
  zIndex: 2,
};

export default function Overlay({ children }) {
  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
