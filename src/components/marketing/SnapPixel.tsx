import Script from 'next/script';

const SNAP_PIXEL_BASE_CODE = `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');

snaptr('init', '998e0cce-14e8-4cfb-b55e-e7eea8fe5f25', {
'user_email': '__INSERT_USER_EMAIL__'
});

snaptr('track', 'PAGE_VIEW');`;

export function SnapPixel() {
  return (
    <Script id="snap-pixel" strategy="afterInteractive">
      {SNAP_PIXEL_BASE_CODE}
    </Script>
  );
}
