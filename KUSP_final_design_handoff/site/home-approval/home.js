const planTemplate = document.querySelector('#masterplan-template');

document.querySelectorAll('[data-masterplan]').forEach((host) => {
  host.appendChild(planTemplate.content.cloneNode(true));
});

const readData = {
  terrain: {
    index: '01 / 06',
    title: 'TERRAIN',
    copy: 'Topography establishes where water moves, land holds and routes can sit.',
  },
  movement: {
    index: '02 / 06',
    title: 'MOVEMENT',
    copy: 'Road hierarchy reveals how access and connectivity structure the site.',
  },
  water: {
    index: '03 / 06',
    title: 'WATER',
    copy: 'Blue-green systems make resilience and public realm visible together.',
  },
  fabric: {
    index: '04 / 06',
    title: 'URBAN FABRIC',
    copy: 'Urban grain and built form establish the context for intervention.',
  },
  constraints: {
    index: '05 / 06',
    title: 'CONSTRAINTS',
    copy: 'Limits become practical when their spatial consequences are read clearly.',
  },
  opportunities: {
    index: '06 / 06',
    title: 'OPPORTUNITIES',
    copy: 'Civic potential emerges where systems can become shared value.',
  },
};

const lensData = {
  planning: {
    caption: 'BLOCK / PARCEL / CIVIC STRUCTURE',
    copy: 'Planning turns a site into a legible urban structure.',
  },
  economics: {
    caption: 'INTENSITY / VALUE / DEVELOPMENT LOGIC',
    copy: 'Strategic plots show how a place can become investable and implementable.',
  },
  geospatial: {
    caption: 'GIS / SUITABILITY / MAPPED INTELLIGENCE',
    copy: 'Spatial data becomes an informed basis for action.',
  },
  infrastructure: {
    caption: 'CORRIDOR / UTILITY / TRANSIT',
    copy: 'Movement and servicing bind a development system together.',
  },
  sustainability: {
    caption: 'BLUE-GREEN / RESILIENCE / ECOLOGICAL CONNECTION',
    copy: 'Environmental stewardship shapes a future-ready spatial system.',
  },
};

const frameworkData = {
  observe: { index: '01 / 05', title: 'OBSERVE', copy: 'Understand the place.' },
  analyse: { index: '02 / 05', title: 'ANALYSE', copy: 'Transform data into intelligence.' },
  integrate: { index: '03 / 05', title: 'INTEGRATE', copy: 'Connect planning, infrastructure and economics.' },
  optimise: { index: '04 / 05', title: 'OPTIMISE', copy: 'Test and refine development scenarios.' },
  deliver: { index: '05 / 05', title: 'DELIVER', copy: 'Implement resilient, future-ready solutions.' },
};

const sectorData = {
  city: { index: '01 / 08', caption: 'Dense urban blocks and public-realm structure.' },
  industrial: { index: '02 / 08', caption: 'Large plots, production logic and a logistics corridor.' },
  transport: { index: '03 / 08', caption: 'Multimodal network geometry and connected movement.' },
  energy: { index: '04 / 08', caption: 'Utility systems, resource networks and resilient infrastructure.' },
  civic: { index: '05 / 08', caption: 'A legible institutional campus and civic framework.' },
  environment: { index: '06 / 08', caption: 'Blue-green systems, landscape and ecological connection.' },
  heritage: { index: '07 / 08', caption: 'A precinct structure for culture, public realm and place-making.' },
  digital: { index: '08 / 08', caption: 'Mapped smart-place infrastructure and spatial intelligence.' },
};

const updateReading = (read) => {
  document.querySelector('.reading-plan').dataset.read = read;
  document.querySelectorAll('.reading-control').forEach((button) => {
    const selected = button.dataset.read === read;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const content = readData[read];
  document.querySelector('[data-reading-index]').textContent = content.index;
  document.querySelector('[data-reading-name]').textContent = content.title;
  document.querySelector('[data-reading-copy]').textContent = content.copy;
};

const updateLens = (lens) => {
  document.querySelector('.lens-plan').dataset.lens = lens;
  document.querySelectorAll('.lens-control').forEach((button) => {
    const selected = button.dataset.lens === lens;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const content = lensData[lens];
  document.querySelector('[data-lens-caption]').textContent = content.caption;
  document.querySelector('[data-lens-copy]').textContent = content.copy;
};

const updateFramework = (step) => {
  document.querySelector('.framework-stage').dataset.frameworkStage = step;
  document.querySelector('.framework-plan').dataset.framework = step;
  document.querySelectorAll('.framework-control').forEach((button) => {
    const selected = button.dataset.framework === step;
    button.classList.toggle('is-active', selected);
    if (selected) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  const content = frameworkData[step];
  document.querySelector('[data-framework-index]').textContent = content.index;
  document.querySelector('[data-framework-name]').textContent = content.title;
  document.querySelector('[data-framework-copy]').textContent = content.copy;
};

document.querySelectorAll('.reading-control').forEach((button) => {
  button.addEventListener('click', () => updateReading(button.dataset.read));
});

document.querySelectorAll('.lens-control').forEach((button) => {
  button.addEventListener('click', () => updateLens(button.dataset.lens));
});

document.querySelectorAll('.framework-control').forEach((button) => {
  button.addEventListener('click', () => updateFramework(button.dataset.framework));
});

document.querySelectorAll('[data-sector]').forEach((button) => {
  const item = button.closest('.sector-item');
  const setSector = () => {
    document.querySelectorAll('.sector-item').forEach((node) => node.classList.remove('is-active'));
    item.classList.add('is-active');
    const content = sectorData[button.dataset.sector];
    document.querySelector('.sector-typology').dataset.sectorDiagram = button.dataset.sector;
    document.querySelector('[data-sector-index]').textContent = content.index;
    document.querySelector('[data-sector-caption]').textContent = content.caption;
  };
  button.addEventListener('pointerenter', setSector);
  button.addEventListener('focus', setSector);
  button.addEventListener('click', setSector);
});

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let frameworkHasPlayed = false;
const frameworkObserver = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting || frameworkHasPlayed || reduceMotion) return;
    frameworkHasPlayed = true;
    const sequence = ['observe', 'analyse', 'integrate', 'optimise', 'deliver'];
    let index = 0;
    const advance = () => {
      updateFramework(sequence[index]);
      index += 1;
      if (index < sequence.length) window.setTimeout(advance, 1250);
    };
    advance();
  },
  { threshold: 0.58 },
);
frameworkObserver.observe(document.querySelector('#framework'));

const header = document.querySelector('.site-header');
const headerObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) header.dataset.tone = visible.target.dataset.headerTone || 'light';
  },
  { threshold: [0.2, 0.5, 0.75] },
);
document.querySelectorAll('.home-section').forEach((section) => headerObserver.observe(section));

updateReading('terrain');
updateLens('planning');
updateFramework('observe');
