import React from 'react';
import { useT } from '../i18n/useT';
import { GITHUB_URL, AUTHOR_URL, AUTHOR_LABEL } from '../constants';

const AppFooter: React.FC = () => {
  const t = useT();

  return (
    <footer className="app-footer">
      <a href={GITHUB_URL} target="_blank" rel="noopener" className="app-footer__link">
        <i className="pi pi-github" /> {t.github}
      </a>
      <span className="app-footer__sep">·</span>
      <a href={AUTHOR_URL} target="_blank" rel="noopener" className="app-footer__link">
        {AUTHOR_LABEL}
      </a>
      <span className="app-footer__sep">·</span>
      <span className="app-footer__meta">v{__APP_VERSION__}</span>
      <span className="app-footer__sep">·</span>
      <span className="app-footer__meta">{t.builtAt} {new Date(__BUILD_TIME__).toLocaleString()}</span>
    </footer>
  );
};

export default AppFooter;
