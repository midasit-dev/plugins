//latlongserch.tsx
import React, { useState } from 'react';
import { GuideBox, TextFieldV2, Button } from "@midasit-dev/moaui";
import { VarLatitude, VarLongitude, VarFindAddress, VarInputAddress } from './variables'
import { useRecoilState, useRecoilValue } from 'recoil';

const CompLatLongSearch = () => {
  const [latitude, setLatitude] = useRecoilState(VarLatitude);
  const [longitude, setLongitude] = useRecoilState(VarLongitude);
  const [findAddress, setFindAddress] = useRecoilState(VarFindAddress);
  const [address, setAddress] = useRecoilState(VarInputAddress);

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(e.target.value);
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(e.target.value);
  };

  async function getAddressFromLatLng() {
    const apiKey = 'AIzaSyBUGWFaf1gzcN4i18zqGrRt1CS5nRcASbY'
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        setAddress(data.results[0].formatted_address);
        setFindAddress(true);
      } else {
        setLongitude('');
        setLatitude('');
        setAddress('');
        setFindAddress(false);
      }
    } catch (error) {
      setLongitude('');
      setLatitude('');
      setAddress('');
      setFindAddress(false);
    }
  }

  const handleSearchClick = () => {
    getAddressFromLatLng();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLongitude(String(lng));
      setLatitude(String(lat));
    } else {
      alert('Please enter the correct latitude and longitude.');
    }
  };

  return (
    <GuideBox width='100%' horCenter>
      <GuideBox spacing={2} row horSpaceBetween>
        <TextFieldV2
          width="120px"
          placeholder="Latitude"
          title=""
          titlePosition="left"
          disabled={false}
          defaultValue=""
          error={false}
          value={latitude}
          onChange={handleLatitudeChange}
        />
        <TextFieldV2
          width="120px"
          placeholder="Longitude"
          title=""
          titlePosition="left"
          disabled={false}
          defaultValue=""
          error={false}
          value={longitude}
          onChange={handleLongitudeChange}
        />
        <Button variant="contained" onClick={handleSearchClick}>Search</Button>
      </GuideBox>
    </GuideBox>
  );
}

export default CompLatLongSearch;
