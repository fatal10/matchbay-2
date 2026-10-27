/**
 * Reusable CountryFlag component
 *
 * Renders a circular country flag badge matching MatchBay design:
 * - Circle (16px to 20px, scalable)
 * - Thin border (#143034) on dark teal background (#0a1a1c / #050d0e)
 * - object-fit: cover to fill circle cleanly
 * - Fixed width & height (no layout shift) and loading="lazy"
 * - Meaningful alt text & aria-label with the country name
 * - Automatic fallback to neutral globe SVG on load error or unmapped competitions
 */

import { getCountryForCompetition, CountryFlagInfo } from './competitionCountries';

export interface CountryFlagProps {
  country?: string;
  competition?: string | Record<string, any>;
  size?: number;
  className?: string;
  style?: string;
  marginRight?: number;
}

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function CountryFlag(props: CountryFlagProps | string): string {
  let country: string | undefined;
  let competition: string | Record<string, any> | undefined;
  let size = 18;
  let className = '';
  let customStyle = '';
  let marginRight = 6;

  if (typeof props === 'string') {
    competition = props;
  } else if (props && typeof props === 'object') {
    country = props.country;
    competition = props.competition;
    if (typeof props.size === 'number') size = props.size;
    if (props.className) className = props.className;
    if (props.style) customStyle = props.style;
    if (typeof props.marginRight === 'number') marginRight = props.marginRight;
  }

  const info: CountryFlagInfo = getCountryForCompetition(competition || country, country);
  const countryName = info.country || 'Football';
  const flagUrl = info.flagUrl || '/flags/globe.svg';
  const mr = marginRight > 0 ? `margin-right:${marginRight}px;` : '';

  const badgeStyle = [
    'display:inline-flex;',
    'align-items:center;',
    'justify-content:center;',
    `width:${size}px;`,
    `height:${size}px;`,
    `min-width:${size}px;`,
    `min-height:${size}px;`,
    'border-radius:50%;',
    'border:1px solid #143034;',
    'background:#0a1a1c;',
    'overflow:hidden;',
    'flex:none;',
    'vertical-align:middle;',
    'box-sizing:border-box;',
    'line-height:1;',
    mr,
    customStyle,
  ].join('');

  const imgStyle = [
    'width:100%;',
    'height:100%;',
    'object-fit:cover;',
    'display:block;',
    'border-radius:50%;',
  ].join('');

  const onerror = "if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/flags/globe.svg';if(window.isDev){console.warn('[CountryFlag] Reverted to globe fallback for " + escapeHtml(countryName) + "');}}";

  return `<span class="country-flag-badge ${escapeHtml(className)}" data-country="${escapeHtml(countryName)}" style="${badgeStyle}" title="${escapeHtml(countryName)}" aria-label="${escapeHtml(countryName)}"><img src="${escapeHtml(flagUrl)}" alt="${escapeHtml(countryName)}" width="${size}" height="${size}" loading="lazy" style="${imgStyle}" onerror="${onerror}"/></span>`;
}
