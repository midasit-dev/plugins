# Response Spectrum Generator

- This plugin generates **Design Response Spectrum Data** based on selected national seismic design codes.
- Users can define code-specific parameters, and the plugin generates spectral acceleration data for different periods.

## Details

### Version 1.0.0

The following national codes and national annexes are supported:

| File | Standard / National Code | Description |
|---|---|---|
| `code_AS1170_4_2024.py` | AS 1170.4:2024 | Australian Standard for earthquake actions |
| `code_BDS1998_1_2012.py` | BDS EN 1998-1:2012 | Bulgarian National Annex to Eurocode 8 |
| `code_CYS1998_1_2004.py` | CYS EN 1998-1:2004 | Cyprus National Annex to Eurocode 8 |
| `code_DS1998_1_2020.py` | DS EN 1998-1:2020 | Danish National Annex to Eurocode 8 |
| `code_NBN1998_1_2011.py` | NBN EN 1998-1:2011 | Belgian National Annex to Eurocode 8 |
| `code_NF1998_1_2008.py` | NF EN 1998-1:2008 | French National Annex to Eurocode 8 |
| `code_NZS1170_5_2004.py` | NZS 1170.5:2004 | New Zealand Standard for earthquake actions |
| `code_SBC3012018.py` | SBC 301-CR:2018 | Saudi Arabian Seismic Load Standard |
| `code_UNE1998_1_2011.py` | UNE EN 1998-1:2011 | Spanish National Annex to Eurocode 8 |

## Features

- Generates **design response spectrum data** according to the selected national code.
- Allows users to define code-specific input variables.
- Calculates spectral values for different periods.
- Provides a **PREVIEW** graph before generating the final spectrum data.
- Supports multiple national seismic standards, including Eurocode 8 National Annexes and regional seismic loading standards.

## Supported Standards

### Eurocode 8 National Annexes

- According to the Spanish National Annex to Eurocode 8 Seismic Design Standard, **UNE EN 1998-1:2011**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the French National Annex to Eurocode 8 Seismic Design Standard, **NF EN 1998-1:2008**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the Belgian National Annex to Eurocode 8 Seismic Design Standard, **NBN EN 1998-1:2011**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the Danish National Annex to Eurocode 8 Seismic Design Standard, **DS EN 1998-1:2020**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the Bulgarian National Annex to Eurocode 8 Seismic Design Standard, **BDS EN 1998-1:2012**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the Cyprus National Annex to Eurocode 8 Seismic Design Standard, **CYS EN 1998-1:2004**, users can define variables, and based on those, the plugin generates spectral data for different periods.

### Other National Seismic Standards

- According to the Australian Standard for earthquake actions, **AS 1170.4:2024**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the New Zealand Standard for earthquake actions, **NZS 1170.5:2004**, users can define variables, and based on those, the plugin generates spectral data for different periods.
- According to the Saudi Arabian Seismic Load Standard, **SBC 301-CR:2018**, users can define variables, and based on those, the plugin generates spectral data for different periods.

## Preview

- Users can preview the graph of the generated response spectrum through the **PREVIEW** image before finalizing the data.
