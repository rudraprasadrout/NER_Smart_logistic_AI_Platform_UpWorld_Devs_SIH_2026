class ForecastController {
  constructor() {
    this.currentHorizon = 'current';
    this.isPlaying = false;
    this.playTimer = null;
    this.horizons = ['current', '24h', '48h', '72h'];
  }

  init(onHorizonChangeCallback) {
    this.callback = onHorizonChangeCallback;
    document.querySelectorAll('.tb-btn[data-horizon]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.stopPlayback();
        this.setHorizon(btn.dataset.horizon);
      });
    });

    const playBtn = document.getElementById('btn-forecast-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isPlaying ? this.stopPlayback() : this.startPlayback();
      });
    }
  }

  setHorizon(horizon) {
    this.currentHorizon = horizon;
    document.querySelectorAll('.tb-btn[data-horizon]').forEach(b => {
      b.classList.toggle('active', b.dataset.horizon === horizon);
    });
    if (this.callback) this.callback(horizon);
  }

  startPlayback() {
    this.isPlaying = true;
    const playBtn = document.getElementById('btn-forecast-play');
    if (playBtn) playBtn.innerHTML = '&#9646;&#9646;';
    let idx = this.horizons.indexOf(this.currentHorizon);
    this.playTimer = setInterval(() => {
      idx = (idx + 1) % this.horizons.length;
      this.setHorizon(this.horizons[idx]);
    }, 2800);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) clearInterval(this.playTimer);
    const playBtn = document.getElementById('btn-forecast-play');
    if (playBtn) playBtn.innerHTML = '&#9654;';
  }
}

window.forecastController = new ForecastController();
