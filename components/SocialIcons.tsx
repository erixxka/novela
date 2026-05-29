import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

type Props = { size?: number };

export function InstagramIcon({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <RadialGradient
          id="ig0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)"
        >
          <Stop stopColor="#B13589" />
          <Stop offset="0.79309" stopColor="#C62F94" />
          <Stop offset="1" stopColor="#8A3AC8" />
        </RadialGradient>
        <RadialGradient
          id="ig1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)"
        >
          <Stop stopColor="#E0E8B7" />
          <Stop offset="0.444662" stopColor="#FB8A2E" />
          <Stop offset="0.71474" stopColor="#E2425C" />
          <Stop offset="1" stopColor="#E2425C" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id="ig2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="translate(0.5 3) rotate(-8.1301) scale(38.8909 8.31836)"
        >
          <Stop offset="0.156701" stopColor="#406ADC" />
          <Stop offset="0.467799" stopColor="#6A45BE" />
          <Stop offset="1" stopColor="#6A45BE" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig0)" />
      <Rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig1)" />
      <Rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig2)" />
      <Path d="M23 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="white" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M16 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="white" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M6 15.6C6 12.24 6 10.56 6.654 9.276A6 6 0 0 1 9.276 6.654C10.56 6 12.24 6 15.6 6h.8c3.36 0 5.04 0 6.324.654A6 6 0 0 1 25.346 9.276C26 10.56 26 12.24 26 15.6v.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C21.44 26 19.76 26 16.4 26h-.8c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C6 21.44 6 19.76 6 16.4v-.8zm9.6-7.6h.8c1.713 0 2.878.002 3.778.075.877.072 1.325.205 1.638.364a4 4 0 0 1 1.745 1.745c.159.313.292.761.364 1.638C23.998 12.722 24 13.887 24 15.6v.8c0 1.713-.002 2.878-.075 3.778-.072.877-.205 1.325-.364 1.638a4 4 0 0 1-1.745 1.745c-.313.159-.761.292-1.638.364C19.278 23.998 18.113 24 16.4 24h-.8c-1.713 0-2.878-.002-3.778-.075-.877-.072-1.325-.205-1.638-.364a4 4 0 0 1-1.745-1.745c-.159-.313-.292-.761-.364-1.638C8.002 19.278 8 18.113 8 16.4v-.8c0-1.713.002-2.878.075-3.778.072-.877.205-1.325.364-1.638a4 4 0 0 1 1.745-1.745c.313-.159.761-.292 1.638-.364C12.722 8.002 13.887 8 15.6 8z" fill="white" />
    </Svg>
  );
}

export function FacebookIcon({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="fb0" x1="16" y1="2" x2="16" y2="29.917" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#18ACFE" />
          <Stop offset="1" stopColor="#0163E0" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="14" fill="url(#fb0)" />
      <Path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white" />
    </Svg>
  );
}

export function WattpadIcon({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="20" fill="#FF6122" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M28.1004 20.6128C29.172 19.1404 31.0422 16.7404 33.0392 15.903C34.6854 15.2127 36.4013 15.9368 35.9166 17.8355C35.7265 18.58 34.7764 19.5932 34.1128 20.5841C32.9689 22.2924 31.801 24.4612 30.849 26.4247C30.1842 27.796 29.7024 28.9436 28.7447 29.8174C26.3941 31.9619 22.8512 30.0608 23.1188 24.893C21.8018 26.5437 21.0341 30.1549 19.3395 31.8359C18.7104 32.4601 17.2833 33.1515 15.9039 32.7807C12.2357 31.7948 11.5817 25.2154 12.2105 20.3264C12.4719 18.2942 13.1589 16.3731 14.5296 15.8601C15.5316 15.4851 16.9427 15.7538 17.5358 16.2896C18.7377 17.3753 18.4139 19.7567 18.3947 21.5719C19.0278 20.7298 19.8875 19.0984 20.9715 17.8357C21.9467 16.6995 23.2111 15.3479 24.493 15.0871C27.628 14.4493 28.5557 17.4177 28.1004 20.6128Z" fill="white" />
    </Svg>
  );
}
