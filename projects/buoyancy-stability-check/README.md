**Intro**
---------

If buoyancy (uplift pressure) due to groundwater is not properly evaluated during the construction or completion of structures, it can have a significant impact on the stability of soil and underground parts of the structures. Therefore, it is necessary to take appropriate technical measures during design and construction in order to manage its harmful influence.


**Version**
-----------

v1.0.0: Plugin release

**Language**
------------

English

**Benefits of this plugin**
---------------------------

This plug-in automatically calculates the self-weight of the structure based on the Midas Civil NX model. Additionally, users can define the structure to be reviewed and perform buoyancy evaluations during construction.

this plug-in considers various resistance conditions against buoyancy:

* Shear key
* Shear friction force
* Review during construction (ignoring overburden pressure)
* Additional overburden load conditions
  
The buoyancy stability assessment results are provided in real-time based on the review conditions, facilitating efficient buoyancy evaluations. This plugin facilitates preliminary reviews and allows for comparisons with detailed calculation reports prepared by designers to prevent errors.


**How to use this plugin?**
---------------------------


* When the plugin is launched, it automatically loads from the CIVIL NX model by default.
* The 'Add Stage Set' button allows users to define custom conditions for the structure (e.g., buoyancy check during construction).
* Users can select the resistance conditions for buoyancy.
* Soil properties and additional loads can be defined by clicking the 'INPUT DETAILS' button.
* The buoyancy check is performed by defining the allowable safety factor according to the relevant standards.
* All units supported by the Midas Civil NX program are reflected, but results are provided only in the SI system.

**Model File**
--------------

Please refer to provided SAMPLE.mcb file

**Conclusion**
--------------

By conducting convenient reviews based on Midas civil NX modeling, this method enables quicker and more convenient buoyancy stability assessments compared to the traditional approach of manually calculate reports
