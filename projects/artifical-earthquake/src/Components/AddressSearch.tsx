// Code for the AddressSearch component that allows users to search for an address and get the coordinates of the address using the Google Maps API.
//AddressSearch.tsx
import React from 'react';
import { GuideBox, TextFieldV2, Button, Typography } from "@midasit-dev/moaui";
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useRecoilState } from 'recoil';
import { VarFindAddress, VarInputAddress, VarLatitude, VarLongitude } from './variables';

const CompAddressSearch = () => {
  const [address, setAddress] = useRecoilState(VarInputAddress)
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState('');
  const [latitude, setLatitude] = useRecoilState(VarLatitude);
  const [longitude, setLongitude] = useRecoilState(VarLongitude);
  const [findAddress, setFindAddress] = useRecoilState(VarFindAddress);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (value) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input: query,
          key: 'AIzaSyBUGWFaf1gzcN4i18zqGrRt1CS5nRcASbY', // 구글 맵 API 키
        },
      });
      if (response.data.predictions.length > 0) {
        setSuggestions(response.data.predictions.map((prediction: any) => prediction.description));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setAddress(suggestion);
    setSuggestions([]);
    await getCoordinates(suggestion);
  };

  const getCoordinates = async (address: string) => {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: 'AIzaSyBUGWFaf1gzcN4i18zqGrRt1CS5nRcASbY'
        },
      });
      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        setLongitude(Number(location.lng).toFixed(3));
        setLatitude(Number(location.lat).toFixed(3));
        setAddress(response.data.results[0].formatted_address);
        setFindAddress(true);        
        setMessage(``);
      } else {
        setMessage('We could not find the address. Please try again.');
        setLongitude('');
        setLatitude('');
        setAddress('');
        setFindAddress(false);
      }
    } catch (error) {
      setMessage('An error occurred while fetching the coordinates. Please try again.');
      setLongitude('');
      setLatitude('');
      setAddress('');
      setFindAddress(false);
    }
  };

  return (
    <GuideBox width="100%" horCenter>
      <GuideBox spacing={2} row horSpaceBetween>
        <TextFieldV2
          width="250px"
          placeholder="Enter Address"
          title=""
          titlePosition="left"
          disabled={false}
          defaultValue=""
          error={false}
          value={address}
          onChange={handleAddressChange}
        />
        <Button variant="contained" onClick={() => getCoordinates(address)}>
          Search
        </Button>
      </GuideBox>
      {suggestions.length > 0 && (
        <GuideBox padding={1}>
          {suggestions.map((suggestion, index) => (
            <Button key={index} variant="text" onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </GuideBox>
      )}
      {message && (
        <Typography padding={1} variant="body2" color="blue" horLeft={true}>
          {message}
        </Typography>
      )}
    </GuideBox>
  );
};

export default CompAddressSearch;
