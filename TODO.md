Cambio 6 dic24

En patient info
**DONE** - Enter patient first and last name.-…not yours
**DONE** - En gral todos your cambiarlos

MVA ficha:

- Vehicle where were u located…
- Posibilidad de poner “none”. Cuando sos un pedestrian

* No se entiende. Esto implica un cambio, no entra en el scope

- Upload docs: no parecen subir…no se ven adjuntos

* Donde pasó? Hice actulizciones, intentar de vuelta.

- Cifras….no funciona……como deberia ser? Aclarar como escribir ese numero ? - Con punto.

- La cuenta de amount unpaid no sirve

* Si sirve, ejemplo: si pones 1000 and amount billed, 500 en amount paid, automaticamente queda 500 en amount unpaid

- Me sale error si elegies un numero poniendo comas…
- Tiene que ser facil como poner la cifra

* No se ponen comas, solo puntos

- En la parte de upload bills tiene que decir también…en vez de:
  **DONE** - Please upload all documents related to the costs of assistance. Such as medical bills, repatriation bills, funeral costs, or any other costs related to the case

**DONE** - El botón choose files….no seria mejor upload files?

**DONE** - Los unicos campos obligatorios si tiene que haber algunos son:

- Claim ref number
- Patient name
- Date of accident
- Place of accident with country and estate
- (Solo esos…el resto no obligatorio…no email…no nada mas que eso)

En la parte de slip and fall de cargar documento deberia decir:
**DONE** - Please upload all the documents related to the slip and fall accident. Such as police report, internal accident reports, photos of the place of the accident, photos of injuries, and/or any other relevant documents

### NUEVO

FER ACA TE DEJO EL ULTIMO RECAP, CUALQUIER COSA AVISAME

- En el Edit: tiene que tener el mismo formato que el form..
  Sigue habiendo error al cargar documento
- Al cargar form me tira error
- Como elimina un user para sacarle el acceso
- En place of accident (accident information) there has to have the country and state function \_ here is where is important!!!!

**DONE** - Que el vehículo uno aparézcales por defecto y después que se pueda agregar
**DONE** - No salen los users y sale error
**DONE** - En Cost of Assistance: add currency selector
**DONE** - en cost of assistance falta poner la currency para saber en que moneda est bille
**DONE** - No se prude poner me olvide mi contraseña
**DONE** - Company reference number para agregar en seccion de paciente \_ enter the claim reference number, related to the patient
**DONE** - Patient personal Information: en country aclarar. que es pais de residency
**DONE** - En place of accident: place where the accident occur
**DONE** - En P﻿ATIENT PERSONAL INFORMATION add description: In this section you complete with all your policyholder personal information
**DONE** - En ACCIDENT INFORMATION add description: "In this section complete with the most important accident details and select the type of accident that will guide you thought specific requirements for that incident."
**DONE** - EN PERSONAL ATTORNEY: Policyholder es una sola palabra
**DONE** - Apartado antes de empezar elformluraio aclarando qeu esto se peude editar, no importa si todavia no tenes toda la informacion, de a poco podes ir compeltadolo.
**DONE** - sacar de todos los campos la obligacion de completar, solo en datos personales
**DONE** - estado de los casos que sean : under review - pending documentation - settle - closed - denied -
**DONE** - Cuando se edita un claim, aparece de cero editar todo,deberia aparecer la informacion ya cargada y poder editar sobre eso.
**DONE** - Cuando esta en modo negro, no puede ver pasies, poner numero ni edad…
**DONE** - Cuando completas la fecha cuando se despliega la fecha y clickear la fecha, no se cierra solo…. Que se cierre solo.
**DONE** - Cuando se pone submit al hacer click no pasa nada, y cuando clickear de vuelta sale error
**DONE** - Al inicio para explicar antes de llenar el formulario hay que acalrar esto ":﻿This form is intended to be completed with all the details related to the claim assistance. Use it as a guide to provide all the available data in your file or collect the necessary details from the policyholder. You may not have all the information when uploading the claim for the first time, but you can always edit the file and add the pending information as soon as you receive it."
**DONE** - CUando hacers el downliad del pdf aparece en blanco, no con los datos
**DONE** - En Insurance Company section, change "Enter Claims Adjusters name"

<!-- ==================================================================================== -->
<!-- ==================================================================================== -->

NO

- Selector de estados POR país. No para esta instancia, se pasa a la próxima iteración.

- Para accident information, en vez de un input de texgt para el place of accident, agregar selector de país y estado (text input)

SI

**DONE** - Para input de telefono, agregar selector de country code con banderitas.
**DONE** - Para selector de fechas, agregar selector de año, mes, día.
**DONE** - Em ambos Type of Accident & Specific Accident Type, agregar una opciónn de "Others".
**DONE** - Upload Your Documents, post "Accident Information" section, vuela

- Cuando eliges un Type of Accident, SACAR specific accident type (va a ir despues)

<!-- ==================================================================================== -->
<!-- ==================================================================================== -->

<!-- MOTOR VECHILE ACCIDENT -->

**DONE** - Description change "If you had a motor vehicle accident, please complete this section." to "In this section, provide all vehicle details such as a automobile descriptions, and insurance certificates."
**DONE** - En "Motor Vehicle Accident Details", en el selector principal cambiar "Pedestrian hit by a vehicle accident" + "Bycicle accident" por "Pedestrian/Bicycle hit by a vehicle accident".
**DONE** - Segundo selector, cambiar a "Where were you located at the time of the accident?"

- Agregar un selector de "Were you in a rental car?" con opciones "Yes" y "No".
- If "yes", agregar "Name of the rental car company" y "Number of contract agreement".
- Agregar un upload document con un texto que diga "Please upload documents related to the car rental agreement."

**DONE** - En Motor Vehicle Information, agregar una description "In this section, provide the available information for each vehicle involved in the accident."

**DONE** - Agregar botón de "Add another vehicle" que agregue otro formulario de "Motor Vehicle Information".
**DONE** - Cada Vehicle Detail component, must have "License Number", "Year of the vehicle", "Model of the vehicle", "Insurance Company Name", "Policiy Number"

**DONE** - En "Select a Vehicle", cambiar a "Please select the vehicle that you were in at the time of the accident." y que se eleginan de los vehículos creadas ++ pedestrian/bicycle

- Como el punto anterior, pero que se eleginan de los vehículos creadas ++ pedestrian/bicycle

**DONE** - En "Accident Description", cambiar placeholder a "Please write a brief description of the accident."
**DONE** - En Upload Documentation, cambiar "Drag & Drop" to "Please upload all the documents regarding the motor vehicle accident. Such as police report, rental agreement, certificate of insurrance, traffic exchange, pictures from the accident, or any other relevant documents"

<!-- SLIP AND FALL -->

**DONE** - Agregar description "In this section, provide all the details regarding the slip and fall accident."
**DONE** - Slip Description placeholder a: "please write a bief description of the accident."
**DONE** - Agregar opción "Other" en el Slip Accident Type

**DONE** - En Negligence Description, cambiar a "Was there any negligence in the accident?"

- En Witness Information, cambiar a "Was there any witness in the accident?" If yes, show existing inputs "Full Name", "Email", "Phone Number"

**DONE** - Agregar Upload Documents, con titulo "Upload Slip & Fall Documents" y description "Please upload all the documents related to the slip and fall accident. Such as police report, internal police reports, fotos of the place of the accident, injuries, and/or any other relevant documents."

<!-- OTHER ACCIDENTS -->
<!-- Para todo lo que no sea slip&fall/vehicle. se agregar un nuvo upload documents -->
<!-- por ende, si se seleccionar medical malpractice, we renderiza el fileupload componet con los siguientes descriptions y labels: -->

- Para Upload Docouments description:
  - Medical Malpractice
    - "Please upload all the documents regarding the medical malpractice, such as hospital or clini records, patient history, witness statements, and all emai, letters, or messages between the patient and the healthcaser provider discussing the trament or incident, or any other relevant documents"
  - Premises Liability
    - Please upload all documents related to the prmeises liability accidents such as a internal incident report, photos, witness infromation or any document proving negligence by the rpoperty owner or any other relavant doucments
  - Recreatioanl Accidents
    - Please upload all the documents related to the recreational accidents such as internal incident report, photo, witness information, or any other relevant documents proving negligence by the property owner or any other relevant documents
  - Wrongful Death
    - Please upload all documents related to the wrongful death case, such as death certficate, autopsy report, accident or incident report, witness statment, photos, funeral and burial expenses, or any other relevant documents.
  - Aviation Accidents
    - Please upload all the avioation accident such as internal incident report, photos, witness information, any docment proving neglicence yn the property owner, or any other relevant documents.
  - Public Transportation Accidents
    - Please upload all the documents related to the public transportation accidents such as police report, certificate of insurance, traffic exchange, pictures from the accident or any other relevant documents.
  - Animal Attacks
    - Please upload all the documents related to the animal attack accident, such as internal incident report, photo, witness information, or any other relevant documents proving negligence by the property owner or any other relevant documents.

<!-- ==================================================================================== -->
<!-- ==================================================================================== -->

<!-- MEDICAL INFORMATION SECTION -->

**DONE** - Agregar description "In this section, complete with all ongoing medical treatments, or future medical needs."
**DONE** - Cambiar Asstance Types" por "Type of Assistance"
**DONE** - Dentro de Assistance Types, cambiar placeholder a "Describe the type of medical assistance provided."

- Agregar select deplegable con tipos de medical assistance" con opciones "Medical Treatment", "Hospitalization", "Surgery", "Physical Therapy", "Psychological Therapy", "Other"

**DONE** - En Treatment, cambiar placeholder a "Describe the treatment provided"
**DONE** - Primary Care Provider, cambiar placeholder a "Name of the clinic or hostipal that provided the treatment"

**DONE** - Agregar un "Upload Documents" que diga "Please upload all the documents related to the medical treatment. Such as medical records, discharge notes, emergency notes, or any other medical document."

<!-- COST OF ASSISTANCE -->

**DONE** - Agregar descripción "In this sectino, fill with all costs recieved related to the claim, even if they are estimated or over the policy limit."
**DONE** - En el primer input, cambiar "Total Cost" por "Estimated Total Cost", agregar un selector de moneda (para todos).
**DONE** - En "Medical Provider Costs", cambiar a "Medical Provider Bills"

**DONE** - "Medical Provider Bills" agregar, tal como el array de vehicle, un botón de agregar nuevo Cost of Assistance en donde renderizamos un componet (card) con los siguiente inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos

**DONE** - En "Repatriation Bills", agregar tal como array de vehicle, un botón de agregar nuevo Cost of Assistance en donde renderizamos un componet (card) con los siguiente inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos
**DONE** - En Other Bills, una nueva iteración con "Other Bills" con los siguientes inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos

**DONE** - - En Documents Upload, cambiar description for "Please upload all documents related to the costs of assistance. Such as medical bills, repratriation bills, or any other costs related to the case."

<!-- THIRD PARTY INFORMATION -->

**DONE** - Agregar descripción "In this section, completed with all details from any other individual, company, or owner involved, such as an inssurance, establishment owner, assistance company or other company on file"
**DONE** - Le cambiamos el nombre de "Insurance Company Involved" a "Insurance Company"

<!-- ONWER BUSINESS INVOLVED  -->

**DONE** - Sacale "Owner Business Name" por "Business Name"
**DONE** - Sacale "Owner Phone Number" por "Phone Number"
**DONE** - Sacale "Owner REference Number" por "Internal Reference Number"

<!-- CO-INSURED -->

**DONE** - Cambiar "Co-Insurer"
**DONE** - Cambiar inpyt label "Co-Insured" a "Other Insurance Name"
**DONE** - En Upload File, Description cambair a "Upload any insurance certification, membership, or other."

<!-- OTHER PARTY INVOVLED IN THE ACCIDENT -->

**DONE** - En en placeholder, que diga "Please fill with any other third party details"

<!-- PERSONAL ATTORNERY -->

**DONE** - Agregar description "In this section, request and complete with any possible legal representation, the policy holder may have regarding the accident."

<!-- PERSONAL ATTORNEY -->

**DONE** - Cambiar el label de "Attorney Firm Documentation" a "Upload all documents regarding the a law firm".
