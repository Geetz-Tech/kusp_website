const header = document.querySelector('.site-header');

if (header) {
  const updateHeaderTone = () => {
    const contentPoint = document.elementFromPoint(window.innerWidth / 2, header.offsetHeight + 18);
    const section = contentPoint?.closest('[data-header-tone]');
    if (section) header.dataset.tone = section.dataset.headerTone || 'light';
  };
  const headerObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) header.dataset.tone = visible.target.dataset.headerTone || 'light';
    },
    { threshold: [0.2, 0.5, 0.75] },
  );
  document.querySelectorAll('[data-header-tone]').forEach((section) => headerObserver.observe(section));
  window.addEventListener('scroll', updateHeaderTone, { passive: true });
  window.addEventListener('resize', updateHeaderTone);
  updateHeaderTone();
}

const setState = (group, state) => {
  const target = document.querySelector(`[data-state-host="${group}"]`);
  if (target) {
    target.dataset.state = state;
    if (group === 'expertise') target.dataset.lens = state;
    if (group === 'framework') target.dataset.stage = state;
  }
  document.querySelectorAll(`[data-state-control="${group}"]`).forEach((button) => {
    const selected = button.dataset.state === state;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll(`[data-state-panel="${group}"]`).forEach((panel) => {
    panel.hidden = panel.dataset.state !== state;
  });
};

document.querySelectorAll('[data-state-control]').forEach((button) => {
  button.addEventListener('click', () => setState(button.dataset.stateControl, button.dataset.state));
});

const sectorCopy = {
  city: 'Master-planned communities, mixed-use developments, townships, urban regeneration and affordable housing.',
  industrial: 'Industrial parks, manufacturing clusters, logistics hubs, corridors, SEZs and port-led developments.',
  transport: 'Roads, highways, metro, rail, airports, ports, TOD, active mobility and multimodal transport.',
  energy: 'Renewable energy, power infrastructure, water, wastewater, stormwater, solid waste and circular economy.',
  civic: 'Government buildings, civic infrastructure, institutional campuses, defence and municipal development.',
  environment: 'Climate resilience, ESG, biodiversity, nature-based solutions and blue-green infrastructure.',
  heritage: 'Heritage precincts, museums, cultural centres, waterfronts, tourism destinations and place-making.',
  digital: 'Smart cities, ICCCs, digital twins, GIS platforms, technology parks and innovation districts.',
};

document.querySelectorAll('[data-sector-control]').forEach((button) => {
  const chooseSector = () => {
    const sector = button.dataset.sectorControl;
    document.querySelectorAll('[data-sector-control]').forEach((control) => control.classList.remove('is-active'));
    button.classList.add('is-active');
    const art = document.querySelector('.sector-art');
    const summary = document.querySelector('[data-sector-summary]');
    if (art) art.dataset.sector = sector;
    if (summary) summary.textContent = sectorCopy[sector];
  };
  button.addEventListener('click', chooseSector);
  button.addEventListener('focus', chooseSector);
});

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const initStateGroups = () => {
  document.querySelectorAll('[data-state-host]').forEach((host) => {
    const group = host.dataset.stateHost;
    if (host.dataset.state) setState(group, host.dataset.state);
  });
};

initStateGroups();

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const confirmation = form.querySelector('[data-form-confirmation]');
    if (confirmation) confirmation.hidden = false;
  });
});
