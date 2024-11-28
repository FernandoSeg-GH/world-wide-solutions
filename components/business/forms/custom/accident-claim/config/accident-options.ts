export const accidentTypeOptions = [
  {
    label: "Motor Vehicle Accidents",
    value: "motor_vehicle_accidents",
    subOptions: [
      { label: "Car Accident", value: "car_accidents" },
      { label: "Motorcycle Accident", value: "motorcycle_accidents" },
      { label: "Truck Accident", value: "truck_accidents" },
      {
        label: "Pedestrian Accidents hit by a vehicle accident",
        value: "pedestrian_accidents",
      },
      {
        label: "Bicycle Accidents it by a vehicle accident",
        value: "bicycle_accidents",
      },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Slip and Fall",
    value: "slip_and_fall",
    subOptions: [
      {
        label: "Slips on wet or uneven surfaces",
        value: "slips_on_wet_or_uneven_surfaces",
      },
      { label: "Trips over obstacles", value: "trips_over_obstacles" },
      {
        label: "Falls due to poor lighting or inadequate maintenance",
        value: "falls_due_to_poor_lighting_or_maintenance",
      },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Medical Malpractice",
    value: "medical_malpractice",
    subOptions: [
      { label: "Surgical errors", value: "surgical_errors" },
      {
        label: "Misdiagnosis or delayed diagnosis",
        value: "misdiagnosis_or_delayed_diagnosis",
      },
      { label: "Medication errors", value: "medication_errors" },
      { label: "Birth injuries", value: "birth_injuries" },
      { label: "Anesthesia errors", value: "anesthesia_errors" },
    ],
  },
  {
    label: "Premises Liability",
    value: "premises_liability",
    subOptions: [
      {
        label: "Injuries on private or public property",
        value: "injuries_on_private_or_public_property",
      },
      {
        label: "Dog bites or animal attacks",
        value: "dog_bites_or_animal_attacks",
      },
      { label: "Swimming pool accidents", value: "swimming_pool_accidents" },
      {
        label: "Fires or explosions on a property",
        value: "fires_or_explosions_on_a_property",
      },
      {
        label: "Elevator or escalator accidents",
        value: "elevator_or_escalator_accidents",
      },
    ],
  },
  {
    label: "Recreational Accidents",
    value: "recreational_accidents",
    subOptions: [
      { label: "Boating accidents", value: "boating_accidents" },
      {
        label: "Skiing or snowboarding accidents",
        value: "skiing_or_snowboarding_accidents",
      },
      { label: "Amusement park accidents", value: "amusement_park_accidents" },
      { label: "Sports injuries", value: "sports_injuries" },
    ],
  },
  {
    label: "Wrongful Death",
    value: "wrongful_death",
    subOptions: [
      {
        label:
          "Accidents leading to fatal injuries, where the family may file a claim on behalf of the deceased",
        value: "accidents_leading_to_fatal_injuries",
      },
    ],
  },
  {
    label: "Aviation Accidents",
    value: "aviation_accidents",
    subOptions: [
      {
        label: "Commercial airline accidents",
        value: "commercial_airline_accidents",
      },
      {
        label: "Private plane or helicopter crashes",
        value: "private_plane_or_helicopter_crashes",
      },
    ],
  },
  {
    label: "Public Transportation Accidents",
    value: "public_transportation_accidents",
    subOptions: [
      { label: "Bus accidents", value: "bus_accidents" },
      { label: "Train accidents", value: "train_accidents" },
      { label: "Subway or tram accidents", value: "subway_or_tram_accidents" },
    ],
  },
  {
    label: "Dog Bites or Animal Attacks",
    value: "dog_bites_or_animal_attacks",
    subOptions: [
      {
        label:
          "Injuries caused by a pet or wild animal, particularly if the owner was negligent",
        value: "injuries_caused_by_a_pet_or_wild_animal",
      },
    ],
  },
];
