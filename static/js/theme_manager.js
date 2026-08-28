class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('pathner_theme') || 'dark';
    this.apply(this.theme);
    document.querySelectorAll('.theme-toggle').forEach(btn =>
      btn.addEventListener('click', () => this.toggle())
    );
  }

  toggle() { this.apply(this.theme === 'dark' ? 'light' : 'dark'); }

  apply(t) {
    this.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('pathner_theme', t);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = t === 'dark' ? '☀' : '☾';
      btn.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    });
    window.mapEngine?.switchTileLayer?.(t);
  }
}

window.themeManager = new ThemeManager();
