import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  useKakaoLoaderOrigin({
    /** 
     * @참고 https://apis.map.kakao.com/web/guide/
     */
		appkey: process.env.REACT_APP_KAKAO_MAP_API_KEY as string,
    libraries: ["clusterer", "drawing", "services"],
  })
}