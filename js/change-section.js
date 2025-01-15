function showSection(sectionName) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
  
    const activeSection = document.getElementById(sectionName);
    activeSection.style.display = 'block';
}
  