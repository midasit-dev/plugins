import * as React from 'react';
import Stack from "@midasit-dev/moaui/Components/Stack";
import Button from "@midasit-dev/moaui/Components/Button";
export function MainButton(types, texts, clickevent,loading) {
  return (
    <Stack spacing={2} direction="row">
      <Button size="small" variant={types} onClick={clickevent} color="negative" width="200px" loading={loading}>{texts}</Button>
    </Stack>
  );
};

export function SubButton(types, texts, clickevent,loading) {
  return (
    <Stack spacing={2} direction="row">
      <Button size="small" variant={types} onClick={clickevent} color="negative" width="200px" loading={loading}>{texts}</Button>
    </Stack>
  );
};

export function NodeButton(types, texts, clickevent) {
  return (
    <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" style={{ width: '100%' , paddingTop: '10px'}}>
      <Button size="small" variant={types} onClick={clickevent} width="120px">{texts}</Button>
    </Stack>
  );
};
