export const highlightedText = {
    backgroundImage: 'linear-gradient(90deg, #117DEC, #00FFFF, #FF00FF, #117DEC)',
    backgroundSize: '300% auto',
    animation: 'gradient 10s linear infinite',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 8px rgba(17, 125, 236, 0.2)',
    fontWeight: 'bold',
    '@keyframes gradient': {
      '0%': { backgroundPosition: '0% center' },
      '100%': { backgroundPosition: '-300% center' },
    }
  }

export const gradientContainer = {
  backgroundImage: 'linear-gradient(90deg, #117DEC, #00FFFF, #FF00FF, #117DEC)',
  backgroundSize: '300% auto',
}

export const highlightedContainer = {
  backgroundColor: "hsla(210, 98%, 55%, 0.1)",
  border: "2px solid hsla(210, 98%, 55%, 0.6)",
  color: "#fff !important"
}