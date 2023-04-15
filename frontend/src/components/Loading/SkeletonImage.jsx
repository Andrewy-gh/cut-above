import Skeleton from '@mui/material/Skeleton';

const SkeletonImage = () => {
  return (
    <Skeleton
      variant="rectangular"
      sx={{
        aspectRatio: '9 / 16',
        height: 'clamp(400px, 60vh, 600px)',
        height: 'clamp(400px, 60dvh, 600px)',
        marginInline: 'auto',
      }}
    />
  );
};

export default SkeletonImage;
