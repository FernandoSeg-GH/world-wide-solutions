NO

- Selector de estados POR país. No para esta instancia, se pasa a la próxima iteración.

- Para accident information, en vez de un input de texgt para el place of accident, agregar selector de país y estado (text input)

SI

**OK** - Para input de telefono, agregar selector de country code con banderitas.
**OK** - Para selector de fechas, agregar selector de año, mes, día.
**OK** - Em ambos Type of Accident & Specific Accident Type, agregar una opciónn de "Others".
**OK** - Upload Your Documents, post "Accident Information" section, vuela

- Cuando eliges un Type of Accident, SACAR specific accident type (va a ir despues)

<!-- ==================================================================================== -->
<!-- ==================================================================================== -->

<!-- MOTOR VECHILE ACCIDENT -->

**OK** - Description change "If you had a motor vehicle accident, please complete this section." to "In this section, provide all vehicle details such as a automobile descriptions, and insurance certificates."
**OK** - En "Motor Vehicle Accident Details", en el selector principal cambiar "Pedestrian hit by a vehicle accident" + "Bycicle accident" por "Pedestrian/Bicycle hit by a vehicle accident".
**OK** - Segundo selector, cambiar a "Where were you located at the time of the accident?"

- Agregar un selector de "Were you in a rental car?" con opciones "Yes" y "No".
- If "yes", agregar "Name of the rental car company" y "Number of contract agreement".
- Agregar un upload document con un texto que diga "Please upload documents related to the car rental agreement."

**OK** - En Motor Vehicle Information, agregar una description "In this section, provide the available information for each vehicle involved in the accident."

- Agregar botón de "Add another vehicle" que agregue otro formulario de "Motor Vehicle Information".
- Cada Vehicle Detail component, must have "License Number", "Year of the vehicle", "Model of the vehicle", "Insurance Company Name", "Policiy Number"

**OK** - En "Select a Vehicle", cambiar a "Please select the vehicle that you were in at the time of the accident." y que se eleginan de los vehículos creadas ++ pedestrian/bicycle

- Como el punto anterior, pero que se eleginan de los vehículos creadas ++ pedestrian/bicycle

**OK** - En "Accident Description", cambiar placeholder a "Please write a brief description of the accident."
**OK** - En Upload Documentation, cambiar "Drag & Drop" to "Please upload all the documents regarding the motor vehicle accident. Such as police report, rental agreement, certificate of insurrance, traffic exchange, pictures from the accident, or any other relevant documents"

<!-- SLIP AND FALL -->

**OK** - Agregar description "In this section, provide all the details regarding the slip and fall accident."
**OK** - Slip Description placeholder a: "please write a bief description of the accident."
**OK** - Agregar opción "Other" en el Slip Accident Type

**OK** - En Negligence Description, cambiar a "Was there any negligence in the accident?"

- En Witness Information, cambiar a "Was there any witness in the accident?" If yes, show existing inputs "Full Name", "Email", "Phone Number"

**OK** - Agregar Upload Documents, con titulo "Upload Slip & Fall Documents" y description "Please upload all the documents related to the slip and fall accident. Such as police report, internal police reports, fotos of the place of the accident, injuries, and/or any other relevant documents."

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

**OK** - Agregar description "In this section, complete with all ongoing medical treatments, or future medical needs."
**OK** - Cambiar Asstance Types" por "Type of Assistance"
**OK** - Dentro de Assistance Types, cambiar placeholder a "Describe the type of medical assistance provided."

- Agregar select deplegable con tipos de medical assistance" con opciones "Medical Treatment", "Hospitalization", "Surgery", "Physical Therapy", "Psychological Therapy", "Other"

**OK** - En Treatment, cambiar placeholder a "Describe the treatment provided"
**OK** - Primary Care Provider, cambiar placeholder a "Name of the clinic or hostipal that provided the treatment"

- Agregar un "Upload Documents" que diga "Please upload all the documents related to the medical treatment. Such as medical records, discharge notes, emergency notes, or any other medical document."

<!-- COST OF ASSISTANCE -->

**OK** - Agregar descripción "In this sectino, fill with all costs recieved related to the claim, even if they are estimated or over the policy limit."
**OK** - En el primer input, cambiar "Total Cost" por "Estimated Total Cost", agregar un selector de moneda (para todos).
**OK** - En "Medical Provider Costs", cambiar a "Medical Provider Bills"

- "Medical Provider Costs" agregar, tal como el array de vehicle, un botón de agregar nuevo Cost of Assistance en donde renderizamos un componet (card) con los siguiente inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos

- En "Repatriation Costs", agregar tal como array de vehicle, un botón de agregar nuevo Cost of Assistance en donde renderizamos un componet (card) con los siguiente inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos
- En Other Costs, una nueva iteración con "Other Costs" con los siguientes inputs: "Name of provider", "Amount Billed", "Amount Paid", "Amount Unpaid" ====> convertimos de input a array de objetos
- En Documents Upload, cambiar description for "Please upload all documents related to the costs of assistance. Such as medical bills, repratriation bills, or any other costs related to the case."

<!-- THIRD PARTY INFORMATION -->

**OK** - Agregar descripción "In this section, completed with all details from any other individual, company, or owner involved, such as an inssurance, establishment owner, assistance company or other company on file"
**OK** - Le cambiamos el nombre de "Insurance Company Involved" a "Insurance Company"

<!-- ONWER BUSINESS INVOLVED  -->

**OK** - Sacale "Owner Business Name" por "Business Name"
**OK** - Sacale "Owner Phone Number" por "Phone Number"
**OK** - Sacale "Owner REference Number" por "Internal Reference Number"

<!-- CO-INSURED -->

**OK** - Cambiar "Co-Insurer"
**OK** - Cambiar inpyt label "Co-Insured" a "Other Insurance Name"
**OK** - En Upload File, Description cambair a "Upload any insurance certification, membership, or other."

<!-- OTHER PARTY INVOVLED IN THE ACCIDENT -->

**OK** - En en placeholder, que diga "Please fill with any other third party details"

<!-- PERSONAL ATTORNERY -->

**OK** - Agregar description "In this section, request and complete with any possible legal representation, the policy holder may have regarding the accident."

<!-- PERSONAL ATTORNEY -->

**OK** - Cambiar el label de "Attorney Firm Documentation" a "Upload all documents regarding the a law firm".
