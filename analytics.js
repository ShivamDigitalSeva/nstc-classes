// Google Analytics (GA4)
// अपना Measurement ID नीचे डालें, जैसे 'G-AB12CD34EF'। यह सिर्फ़ इसी एक जगह बदलना है।
// अगर यहाँ 'G-XXXXXXXXXX' हो, तो Analytics चालू नहीं होगा।
(function () {
  var MEASUREMENT_ID = 'G-DDDRQT6V9C';
  if (!/^G-[A-Z0-9]{6,}$/.test(MEASUREMENT_ID) || MEASUREMENT_ID.indexOf('XXXX') > -1) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
})();
