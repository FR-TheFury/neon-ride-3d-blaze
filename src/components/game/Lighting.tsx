
export const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.2} color="#000033" />
      
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Neon accent lights */}
      <pointLight position={[0, 5, 0]} intensity={1} color="#00ffff" />
      <pointLight position={[10, 3, 0]} intensity={0.8} color="#ff00ff" />
      <pointLight position={[-10, 3, 0]} intensity={0.8} color="#ff00ff" />
      
      {/* Moving lights */}
      <pointLight position={[0, 2, 10]} intensity={0.6} color="#ffff00" />
      <pointLight position={[0, 2, -10]} intensity={0.6} color="#ff0000" />
    </>
  );
};
