export function scrollToSection(id, onScrollComplete){
    const sectionElement = document.getElementById(id);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });

      if(onScrollComplete) {
        onScrollComplete();
      }
    }
}