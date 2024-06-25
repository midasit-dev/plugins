import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  useKakaoLoaderOrigin({
    /** 
     * @참고 https://apis.map.kakao.com/web/guide/
     */
    appkey: "0bf11228c6c6a578cd75ea0671b9f1ae",
    libraries: ["clusterer", "drawing", "services"],
  })
}