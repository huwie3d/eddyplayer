// You can use this as a component or integrate the styles directly
const MeshBg = ({ 
    colors, 
    breatheBL = 50,
    breatheBR = 50,
    breatheTR = 50,
    className = ""
  }) => {
    const [vibrant, muted, darkVibrant, darkMuted, lightVibrant] = colors;
    
    return (
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${className}`}
        style={{
          backgroundColor: vibrant,
          backgroundImage: `
            /* Main top-left bloom */
            radial-gradient(circle at 25% 25%, ${vibrant} 0px, transparent 50%),
            
            /* Top-right accent */
            radial-gradient(
              circle at 85% 15%, 
              color-mix(in srgb, ${muted} ${breatheTR}%, ${vibrant}) 0px, 
              transparent 45%
            ),
            
            /* Mid-left accent */
            radial-gradient(
              ellipse at 0% ${breatheBL / 10 + 50}%, 
              ${darkVibrant}cc 0px, 
              transparent 20%
            ),
            
            /* Center accent */
            radial-gradient(
              circle at 50% 50%, 
              color-mix(in srgb, ${lightVibrant} 30%, ${vibrant}) 0px, 
              transparent 55%
            ),
            
            /* Bottom-left sweep */
            radial-gradient(
              ellipse at 15% 85%, 
              color-mix(in srgb, ${darkMuted} ${breatheBL}%, ${darkVibrant}) 0px, 
              transparent 70%
            ),
            
            /* Bottom-right accent */
            radial-gradient(
              circle at 80% 80%, 
              color-mix(in srgb, ${lightVibrant} ${breatheBR}%, ${vibrant}) 0px, 
              transparent 65%
            ),

            /* top-left accent */
            radial-gradient(
              circle at 30% 60%, 
              color-mix(in srgb, ${lightVibrant} ${breatheBR}%, ${muted}) 0px, 
              transparent 65%
            ),
            
            /* Subtle top accent */
            radial-gradient(
              ellipse at 50% 0%, 
              color-mix(in srgb, ${muted} 20%, ${vibrant}) 0px, 
              transparent 40%
            ),
            
            /* Left edge glow */
            radial-gradient(
              ellipse at 0% 50%, 
              color-mix(in srgb, ${darkVibrant} 40%, ${vibrant}) 0px, 
              transparent 45%
            ),
            
            /* Bottom glow */
            radial-gradient(
              ellipse at 50% 100%, 
              color-mix(in srgb, ${darkMuted} 30%, ${vibrant}) 0px, 
              transparent 50%
            )
          `
        }}
      />
    );
  };
  
  export default MeshBg;
  
  // Example usage:
  /*
  function AlbumArtwork({ imageUrl }) {
    const { colors, isTransitioning } = useAlbumColors(imageUrl);
    
    return (
      <div className="relative w-full h-full">
        <MeshBg 
          colors={colors}
          breatheBL={50 + Math.sin(Date.now() / 1000) * 25}
          breatheBR={50 + Math.cos(Date.now() / 1000) * 25}
          breatheTR={50 + Math.sin(Date.now() / 1200) * 25}
        />
        <img src={imageUrl} alt="Album artwork" className="relative z-10" />
      </div>
    );
  }
  */