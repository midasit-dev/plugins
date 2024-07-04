import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  useKakaoLoaderOrigin({
    /** 
     * @참고 https://apis.map.kakao.com/web/guide/
     */
    appkey: "f685708cca5fc589ede21c7f27f38f19",
    libraries: ["clusterer", "drawing", "services"],
  })
}