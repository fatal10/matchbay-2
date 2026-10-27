/**
 * MatchBay CountryFlag Reusable UI Component (Browser / UMD)
 */
(function (root, factory) {
  var exp = factory();
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = exp;
  }
  if (typeof define === 'function' && define.amd) {
    define(function () { return exp; });
  }
  if (root) {
    root.CountryFlag = exp.CountryFlag;
    root.CountryFlagComponent = exp;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function CountryFlag(props) {
    var country;
    var competition;
    var size = 18;
    var className = '';
    var customStyle = '';
    var marginRight = 6;

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

    var getCountry = typeof globalThis !== 'undefined' && globalThis.getCountryForCompetition
      ? globalThis.getCountryForCompetition
      : (typeof getCountryForCompetition === 'function' ? getCountryForCompetition : null);

    var info = getCountry
      ? getCountry(competition || country, country)
      : { code: 'globe', country: country || 'Football', flagUrl: '/flags/globe.svg' };

    var countryName = info.country || 'Football';
    var flagUrl = info.flagUrl || '/flags/globe.svg';
    var mr = marginRight > 0 ? 'margin-right:' + marginRight + 'px;' : '';

    var badgeStyle = [
      'display:inline-flex;',
      'align-items:center;',
      'justify-content:center;',
      'width:' + size + 'px;',
      'height:' + size + 'px;',
      'min-width:' + size + 'px;',
      'min-height:' + size + 'px;',
      'border-radius:50%;',
      'border:1px solid #143034;',
      'background:#0a1a1c;',
      'overflow:hidden;',
      'flex:none;',
      'vertical-align:middle;',
      'box-sizing:border-box;',
      'line-height:1;',
      mr,
      customStyle
    ].join('');

    var imgStyle = [
      'width:100%;',
      'height:100%;',
      'object-fit:cover;',
      'display:block;',
      'border-radius:50%;'
    ].join('');

    var onerror = "if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/flags/globe.svg';if(window.isDev){console.warn('[CountryFlag] Reverted to globe fallback for " + esc(countryName) + "');}}";

    return '<span class="country-flag-badge ' + esc(className) + '" data-country="' + esc(countryName) + '" style="' + badgeStyle + '" title="' + esc(countryName) + '" aria-label="' + esc(countryName) + '"><img src="' + esc(flagUrl) + '" alt="' + esc(countryName) + '" width="' + size + '" height="' + size + '" loading="lazy" style="' + imgStyle + '" onerror="' + onerror + '"/></span>';
  }

  return {
    CountryFlag: CountryFlag
  };
});
