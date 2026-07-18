// Moon Day Quiz Question Pool
// 50 Junior Questions & 50 Senior Questions

const JUNIOR_QUESTIONS = [
  {
    id: 1,
    question: "Who was the first person to walk on the Moon?",
    options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"],
    answer: 1
  },
  {
    id: 2,
    question: "In which year did humans first land on the Moon?",
    options: ["1965", "1969", "1972", "1975"],
    answer: 1
  },
  {
    id: 3,
    question: "What is the name of India's first lunar mission?",
    options: ["Chandrayaan-1", "Chandrayaan-2", "Mangalyaan", "Aditya-L1"],
    answer: 0
  },
  {
    id: 4,
    question: "Which country became the first to successfully land a spacecraft near the Moon's south pole?",
    options: ["USA", "Russia", "China", "India"],
    answer: 3
  },
  {
    id: 5,
    question: "What is the Moon to the Earth?",
    options: ["A planet", "An asteroid", "A natural satellite", "A star"],
    answer: 2
  },
  {
    id: 6,
    question: "Approximately how long does it take for the Moon to complete one orbit around the Earth?",
    options: ["24 hours", "7 days", "27.3 days", "365 days"],
    answer: 2
  },
  {
    id: 7,
    question: "What are the large, dark, flat plains on the Moon called?",
    options: ["Craters", "Maria (Seas)", "Highlands", "Rilles"],
    answer: 1
  },
  {
    id: 8,
    question: "What was the name of the Apollo 11 Lunar Module that landed on the Moon?",
    options: ["Columbia", "Eagle", "Falcon", "Challenger"],
    answer: 1
  },
  {
    id: 9,
    question: "Who was the second person to walk on the Moon?",
    options: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins", "Alan Shepard"],
    answer: 1
  },
  {
    id: 10,
    question: "Who was the pilot of the Apollo 11 Command Module who stayed in lunar orbit while others walked on the surface?",
    options: ["Michael Collins", "Pete Conrad", "John Young", "Jim Lovell"],
    answer: 0
  },
  {
    id: 11,
    question: "Which Chandrayaan mission successfully landed the 'Vikram' lander on the Moon?",
    options: ["Chandrayaan-1", "Chandrayaan-2", "Chandrayaan-3", "Chandrayaan-4"],
    answer: 2
  },
  {
    id: 12,
    question: "What is the name of the robotic rover deployed by India's Chandrayaan-3 mission?",
    options: ["Pragyan", "Vikram", "Vyommitra", "Mangal"],
    answer: 0
  },
  {
    id: 13,
    question: "What is the name of the lander component of Chandrayaan-3?",
    options: ["Pragyan", "Vikram", "Dhruv", "Kalam"],
    answer: 1
  },
  {
    id: 14,
    question: "What causes the phases of the Moon as seen from Earth?",
    options: [
      "Clouds blocking the Moon",
      "The shadow of the Earth falling on the Moon",
      "The Moon's orbit around Earth changing the angle of sunlight reflected",
      "The Moon spinning very fast"
    ],
    answer: 2
  },
  {
    id: 15,
    question: "Approximately what percentage of the Moon's surface is ever visible from Earth?",
    options: ["100%", "50%", "59%", "25%"],
    answer: 2
  },
  {
    id: 16,
    question: "The Moon has almost no atmosphere. This means it lacks which of the following?",
    options: ["Gravity", "Air to breathe and carry sound", "Rocks", "Sunlight"],
    answer: 1
  },
  {
    id: 17,
    question: "How does the gravity on the surface of the Moon compare to that of the Earth?",
    options: ["It is the same", "It is twice as strong", "It is 1/6th of Earth's gravity", "It has zero gravity"],
    answer: 2
  },
  {
    id: 18,
    question: "What is the name of NASA's current program to send astronauts, including the first woman, back to the Moon?",
    options: ["Apollo", "Artemis", "Gemini", "Orion"],
    answer: 1
  },
  {
    id: 19,
    question: "What occurs when the Moon passes directly between the Sun and the Earth, blocking the Sun?",
    options: ["Lunar Eclipse", "Solar Eclipse", "Supermoon", "New Moon"],
    answer: 1
  },
  {
    id: 20,
    question: "What occurs when the Earth passes directly between the Sun and the Moon, casting a shadow on the Moon?",
    options: ["Lunar Eclipse", "Solar Eclipse", "Blue Moon", "Solar Flare"],
    answer: 0
  },
  {
    id: 21,
    question: "What is the average distance between the Earth and the Moon?",
    options: ["150,000 km", "384,400 km", "1 million km", "57,000 km"],
    answer: 1
  },
  {
    id: 22,
    question: "Does the Moon produce its own light?",
    options: ["Yes, through nuclear fusion", "Yes, it glows in the dark", "No, it reflects sunlight", "No, it reflects Earth's city lights"],
    answer: 2
  },
  {
    id: 23,
    question: "Who is recognized as the Father of the Indian Space Program?",
    options: ["Dr. A.P.J. Abdul Kalam", "Dr. Vikram Sarabhai", "Dr. Homi Bhabha", "Dr. K. Sivan"],
    answer: 1
  },
  {
    id: 24,
    question: "What does the abbreviation ISRO stand for?",
    options: [
      "International Space Research Organization",
      "Indian Space Research Organisation",
      "Indian Science Research Office",
      "Integrated Space Research Operations"
    ],
    answer: 1
  },
  {
    id: 25,
    question: "From which space centre in Sriharikota does India launch its lunar missions?",
    options: [
      "Vikram Sarabhai Space Centre",
      "Satish Dhawan Space Centre",
      "Space Applications Centre",
      "ISRO Propulsion Complex"
    ],
    answer: 1
  },
  {
    id: 26,
    question: "Which Chandrayaan mission first confirmed the presence of water molecules on the Moon?",
    options: ["Chandrayaan-1", "Chandrayaan-2", "Chandrayaan-3", "LUPEX"],
    answer: 0
  },
  {
    id: 27,
    question: "What is the name given to the landing site of Chandrayaan-3 on the Moon?",
    options: ["Jawahar Point", "Tiranga Point", "Shiv Shakti Point", "Vikram Land"],
    answer: 2
  },
  {
    id: 28,
    question: "What is the name of the point where Chandrayaan-2's lander crash-landed?",
    options: ["Tiranga Point", "Shiv Shakti Point", "Jawahar Point", "Swaraj Point"],
    answer: 0
  },
  {
    id: 29,
    question: "What was the name of the first artificial satellite launched into space by humans?",
    options: ["Explorer 1", "Sputnik 1", "Apollo 1", "Aryabhata"],
    answer: 1
  },
  {
    id: 30,
    question: "How many humans have walked on the surface of the Moon so far?",
    options: ["2", "6", "12", "24"],
    answer: 2
  },
  {
    id: 31,
    question: "Which Apollo mission was called a 'successful failure' because it returned its crew safely after an oxygen tank exploded?",
    options: ["Apollo 8", "Apollo 11", "Apollo 13", "Apollo 17"],
    answer: 2
  },
  {
    id: 32,
    question: "What is a 'Supermoon'?",
    options: [
      "A moon that has special powers",
      "A full moon that occurs when the Moon is closest to Earth in its orbit",
      "A moon that appears blue in color",
      "An eclipse of the Moon"
    ],
    answer: 1
  },
  {
    id: 33,
    question: "What is the popular term for the second full moon in a single calendar month?",
    options: ["Harvest Moon", "Blood Moon", "Blue Moon", "New Moon"],
    answer: 2
  },
  {
    id: 34,
    question: "What is the shape of the Moon's orbit around the Earth?",
    options: ["Perfect Circle", "Elliptical (Oval)", "Square", "Spiral"],
    answer: 1
  },
  {
    id: 35,
    question: "Why can't you hear sounds on the Moon?",
    options: [
      "It is too cold for sound to travel",
      "There is no air/atmosphere to transmit sound waves",
      "Astronaut helmets block all sounds",
      "The gravity is too low"
    ],
    answer: 1
  },
  {
    id: 36,
    question: "What is the layer of loose, powdery dust and rocky debris on the Moon's surface called?",
    options: ["Soil", "Regolith", "Magma", "Basalt"],
    answer: 1
  },
  {
    id: 37,
    question: "Which of these is the main cause of ocean tides on Earth?",
    options: [
      "Earth's rotation speed",
      "Undersea earthquakes",
      "The gravitational pull of the Moon",
      "The wind blowing across oceans"
    ],
    answer: 2
  },
  {
    id: 38,
    question: "Who was the first woman to travel into space?",
    options: ["Sally Ride", "Valentina Tereshkova", "Kalpana Chawla", "Sunita Williams"],
    answer: 1
  },
  {
    id: 39,
    question: "How many Apollo missions successfully landed astronauts on the Moon?",
    options: ["1", "5", "6", "9"],
    answer: 2
  },
  {
    id: 40,
    question: "What is the boundary line separating the illuminated (day) side and dark (night) side of the Moon?",
    options: ["Horizon", "Terminator", "Equator", "Eclipse line"],
    answer: 1
  },
  {
    id: 41,
    question: "Which of the following is the largest moon in the entire Solar System?",
    options: ["Titan", "Ganymede", "The Earth's Moon", "Europa"],
    answer: 1
  },
  {
    id: 42,
    question: "What is the name of the upcoming joint lunar polar exploration mission of ISRO and JAXA (Japan)?",
    options: ["Chandrayaan-4", "LUPEX", "Artemis III", "Gaganyaan"],
    answer: 1
  },
  {
    id: 43,
    question: "In what year did India launch its first Moon mission, Chandrayaan-1?",
    options: ["2005", "2008", "2013", "2019"],
    answer: 1
  },
  {
    id: 44,
    question: "What is the moon of Mars?",
    options: ["Titan", "Phobos", "Io", "Charon"],
    answer: 1
  },
  {
    id: 45,
    question: "Which country launched the first spacecraft to soft-land on the Moon (Luna 9)?",
    options: ["USA", "Soviet Union (USSR)", "China", "India"],
    answer: 1
  },
  {
    id: 46,
    question: "Who was the first Indian-born woman to go to space?",
    options: ["Sunita Williams", "Kalpana Chawla", "Shirish Bandla", "Pratibha Patil"],
    answer: 1
  },
  {
    id: 47,
    question: "What is the name of the point where Chandrayaan-1's Moon Impact Probe crashed?",
    options: ["Jawahar Point", "Tiranga Point", "Shakti Point", "Nehru Point"],
    answer: 0
  },
  {
    id: 48,
    question: "What color does the Moon often appear during a total lunar eclipse?",
    options: ["Bright Green", "Deep Blue", "Reddish-orange (Blood Moon)", "Pitch Black"],
    answer: 2
  },
  {
    id: 49,
    question: "How long does a lunar day (one rotation on its axis relative to the Sun) last in Earth days?",
    options: ["24 hours", "7 days", "29.5 Earth days", "365 days"],
    answer: 2
  },
  {
    id: 50,
    question: "Which of these features does the Moon have?",
    options: ["Active volcanoes", "Liquid water oceans", "Craters", "Thick clouds"],
    answer: 2
  }
];

const SENIOR_QUESTIONS = [
  {
    id: 51,
    question: "What is the most widely accepted scientific theory for the origin of the Moon?",
    options: [
      "Fission Theory (split from Earth)",
      "Capture Theory (captured by Earth's gravity)",
      "Giant Impact Hypothesis (Theia collision)",
      "Co-formation Theory (formed alongside Earth)"
    ],
    answer: 2
  },
  {
    id: 52,
    question: "During which Apollo mission did astronauts first drive the Lunar Roving Vehicle (LRV) on the Moon?",
    options: ["Apollo 11", "Apollo 12", "Apollo 15", "Apollo 17"],
    answer: 2
  },
  {
    id: 53,
    question: "What are 'Mascons' on the Moon?",
    options: [
      "Massive ancient lunar craters",
      "Concentrations of high gravitational pull beneath the maria",
      "Special suits worn by Apollo astronauts",
      "Magnetic storms on the lunar surface"
    ],
    answer: 1
  },
  {
    id: 54,
    question: "Launched in 1966, which Soviet spacecraft was the first to successfully enter orbit around the Moon?",
    options: ["Luna 3", "Luna 9", "Luna 10", "Sputnik 10"],
    answer: 2
  },
  {
    id: 55,
    question: "What is the specific term for the lunar orbit position when the Moon is closest to Earth?",
    options: ["Apogee", "Perigee", "Perihelion", "Aphelion"],
    answer: 1
  },
  {
    id: 56,
    question: "What is the specific term for the lunar orbit position when the Moon is farthest from Earth?",
    options: ["Apogee", "Perigee", "Aphelion", "Apoapsis"],
    answer: 0
  },
  {
    id: 57,
    question: "How many degrees is the Moon's orbital plane tilted relative to the Earth's ecliptic plane?",
    options: ["0 degrees", "5.14 degrees", "23.5 degrees", "12.5 degrees"],
    answer: 1
  },
  {
    id: 58,
    question: "Why does the Moon show only one face to the Earth at all times?",
    options: [
      "It does not rotate on its axis",
      "It is in a 1:1 spin-orbit tidal lock with Earth",
      "Earth's magnetic field stops its rotation",
      "It rotates at twice the speed of Earth"
    ],
    answer: 1
  },
  {
    id: 59,
    question: "Which space agency successfully launched South Korea's first lunar orbiter, Danuri (KPLO), in 2022?",
    options: ["JAXA", "ESA", "KARI", "ISRO"],
    answer: 2
  },
  {
    id: 60,
    question: "In what year did the Soviet Union's Luna 2 spacecraft impact the Moon, becoming the first human-made object to reach its surface?",
    options: ["1957", "1959", "1961", "1966"],
    answer: 1
  },
  {
    id: 61,
    question: "Which Soviet space probe took the very first photographs of the far side of the Moon in October 1959?",
    options: ["Luna 1", "Luna 2", "Luna 3", "Zond 3"],
    answer: 2
  },
  {
    id: 62,
    question: "Which Apollo mission was the first manned flight to orbit the Moon (without landing) on Christmas Eve, 1968?",
    options: ["Apollo 7", "Apollo 8", "Apollo 9", "Apollo 10"],
    answer: 1
  },
  {
    id: 63,
    question: "Who was the commander of Apollo 17 and, consequently, the last person to walk on the Moon?",
    options: ["Gene Cernan", "Harrison Schmitt", "Alan Shepard", "John Young"],
    answer: 0
  },
  {
    id: 64,
    question: "Which Apollo mission was the only one to include a professional geologist, Harrison Schmitt, in its landing crew?",
    options: ["Apollo 14", "Apollo 15", "Apollo 16", "Apollo 17"],
    answer: 3
  },
  {
    id: 65,
    question: "What titanium-rich mineral discovered in Apollo 11 lunar samples was named after Armstrong, Aldrin, and Collins?",
    options: ["Anorthosite", "Armalcolite", "Regolithite", "Tranquillityite"],
    answer: 1
  },
  {
    id: 66,
    question: "Which element is the most abundant in the lunar crust by mass?",
    options: ["Silicon", "Oxygen", "Iron", "Titanium"],
    answer: 1
  },
  {
    id: 67,
    question: "What is the main geological rock type that constitutes the bright lunar highlands?",
    options: ["Basalt", "Anorthosite", "Granite", "Rhyolite"],
    answer: 1
  },
  {
    id: 68,
    question: "Which instrument on Chandrayaan-3's Vikram lander was designed to measure the thermal properties of the lunar topsoil?",
    options: ["ChaSTE", "ILSA", "RAMBHA", "APXS"],
    answer: 0
  },
  {
    id: 69,
    question: "Which instrument on Chandrayaan-3's Pragyan Rover used laser pulses to determine the elemental composition of the lunar soil?",
    options: ["APXS", "LIBS", "ChaSTE", "LP"],
    answer: 1
  },
  {
    id: 70,
    question: "What is the name of the NASA spacecraft launched in 2009 that continues to orbit the Moon and map its surface in high resolution?",
    options: ["Clementine", "Lunar Prospector", "LRO (Lunar Reconnaissance Orbiter)", "GRAIL"],
    answer: 2
  },
  {
    id: 71,
    question: "Who was the director of the Software Engineering Division that created the on-board flight software for the Apollo project?",
    options: ["Katherine Johnson", "Margaret Hamilton", "Grace Hopper", "Dorothy Vaughan"],
    answer: 1
  },
  {
    id: 72,
    question: "How many stable Lagrange points exist in the Earth-Moon system where gravitational and orbital forces balance?",
    options: ["2", "3", "5", "4"],
    answer: 2
  },
  {
    id: 73,
    question: "Which two Lagrange points in the Earth-Moon orbit system are gravitationally stable without active propulsion?",
    options: ["L1 and L2", "L2 and L3", "L4 and L5", "L1 and L3"],
    answer: 2
  },
  {
    id: 74,
    question: "What is the primary toxic and mechanical hazard posed by lunar regolith dust to future astronauts?",
    options: [
      "It is radioactive and glows",
      "It is highly abrasive and can cause lung damage similar to silicosis",
      "It contains poisonous organic microbes",
      "It instantly melts when touched"
    ],
    answer: 1
  },
  {
    id: 75,
    question: "What is the name of the prominent lunar crater at the South Pole where water ice is concentrated in permanent shadows?",
    options: ["Tycho", "Copernicus", "Shackleton", "Clavius"],
    answer: 2
  },
  {
    id: 76,
    question: "What is the term for regions near the lunar poles that never receive direct sunlight?",
    options: ["Dark Side Zones", "Permanently Shadowed Regions (PSRs)", "Polar Cold Traps", "Cryogenic Basins"],
    answer: 1
  },
  {
    id: 77,
    question: "Which private Japanese company launched the Hakuto-R commercial lunar lander in late 2022?",
    options: ["ispace", "Astroscale", "JAXA", "Mitsubishi Heavy Industries"],
    answer: 0
  },
  {
    id: 78,
    question: "Which joint NASA-DoD mission launched in 1994 returned the first digital mapping data suggesting water ice at the lunar poles?",
    options: ["Lunar Prospector", "Clementine", "Galileo", "Pioneer 4"],
    answer: 1
  },
  {
    id: 79,
    question: "Which 1998 NASA mission mapped the Moon's gravity and composition, confirming the presence of hydrogen at the poles?",
    options: ["Clementine", "GRAIL", "Lunar Prospector", "LADEE"],
    answer: 2
  },
  {
    id: 80,
    question: "What is the term for the faint illumination of the Moon's dark side by sunlight reflected from Earth?",
    options: ["Earthshine (or Da Vinci Glow)", "Solar Glare", "Albedo reflection", "Zodiacal Light"],
    answer: 0
  },
  {
    id: 81,
    question: "What is the length of a synodic month (the time between consecutive new moons) in Earth days?",
    options: ["27.32 days", "28.00 days", "29.53 days", "30.50 days"],
    answer: 2
  },
  {
    id: 82,
    question: "What is the length of a sidereal month (the time it takes the Moon to complete one full orbit relative to stars)?",
    options: ["27.32 days", "29.53 days", "28.50 days", "30.00 days"],
    answer: 0
  },
  {
    id: 83,
    question: "Why is a synodic month longer than a sidereal month?",
    options: [
      "The Moon's orbit slows down slightly each month",
      "The Earth moves forward in its orbit around the Sun during that time",
      "Earth's rotation slows down",
      "Relativistic time dilation"
    ],
    answer: 1
  },
  {
    id: 84,
    question: "What is the largest basaltic plain (mare) on the Moon, covering over 4 million square kilometers?",
    options: ["Mare Imbrium", "Mare Tranquillitatis", "Oceanus Procellarum", "Mare Serenitatis"],
    answer: 2
  },
  {
    id: 85,
    question: "Which Apollo mission was the first to carry a color television camera, transmitting live color broadcasts from the lunar surface?",
    options: ["Apollo 11", "Apollo 12", "Apollo 14", "Apollo 15"],
    answer: 1
  },
  {
    id: 86,
    question: "Which Chinese lunar exploration mission successfully performed the first-ever soft landing on the far side of the Moon in 2019?",
    options: ["Chang'e 3", "Chang'e 4", "Chang'e 5", "Chang'e 6"],
    answer: 1
  },
  {
    id: 87,
    question: "Which Chinese mission returned the first lunar soil samples to Earth since the Soviet Union's Luna 24 in 1976?",
    options: ["Chang'e 3", "Chang'e 4", "Chang'e 5", "Chang'e 6"],
    answer: 2
  },
  {
    id: 88,
    question: "What is the name of the astronomical phenomenon where sunlight shining through lunar valleys creates bright points during a solar eclipse?",
    options: ["Diamond Ring Effect", "Baily's Beads", "Corona Sparks", "Umbral Sparkles"],
    answer: 1
  },
  {
    id: 89,
    question: "What are the long, narrow depressions or channels in the lunar surface, often resembling channels, called?",
    options: ["Rilles", "Graben", "Regolith cracks", "Dorsa"],
    answer: 0
  },
  {
    id: 90,
    question: "What is the primary cause of 'moonquakes' that occur deep inside the Moon (depths of 800-1000 km)?",
    options: [
      "Active volcanic magma chambers",
      "Tectonic plate boundaries moving",
      "Earth's tidal gravitational forces",
      "Meteorite impacts"
    ],
    answer: 2
  },
  {
    id: 91,
    question: "What is the name of the chemical group/category that characterizes the highly volcanic basaltic rocks found in the lunar maria?",
    options: ["Anorthosites", "KREEP basalts", "Granulites", "Chondrites"],
    answer: 1
  },
  {
    id: 92,
    question: "Which lunar crater, named after a Danish astronomer, is famous for its prominent ray system extending thousands of kilometers?",
    options: ["Copernicus", "Tycho", "Kepler", "Clavius"],
    answer: 1
  },
  {
    id: 93,
    question: "Which US President officially launched the space race by declaring the goal of landing a man on the Moon before the 1960s ended?",
    options: ["Dwight D. Eisenhower", "John F. Kennedy", "Lyndon B. Johnson", "Richard Nixon"],
    answer: 1
  },
  {
    id: 94,
    question: "What was the name of the first successful US spacecraft to fly past the Moon in 1959?",
    options: ["Pioneer 4", "Explorer 1", "Ranger 3", "Surveyor 1"],
    answer: 0
  },
  {
    id: 95,
    question: "What was the first US spacecraft to successfully soft-land on the Moon in June 1966?",
    options: ["Ranger 7", "Surveyor 1", "Apollo 9", "Pioneer 10"],
    answer: 1
  },
  {
    id: 96,
    question: "Which of the following describes the Moon's magnetic field today?",
    options: [
      "It has a strong global dipole field like Earth",
      "It has no magnetic field at all",
      "It has no global dipole, but possesses localized crustal magnetic anomalies",
      "It changes polarity every 11 years"
    ],
    answer: 2
  },
  {
    id: 97,
    question: "What is the term for the subtle wobbling motion of the Moon that allows Earth observers to see slightly more than 50% of its surface?",
    options: ["Precession", "Nutation", "Libration", "Orbital drift"],
    answer: 2
  },
  {
    id: 98,
    question: "What is the escape velocity on the surface of the Moon?",
    options: ["11.2 km/s", "2.38 km/s", "5.02 km/s", "1.62 km/s"],
    answer: 1
  },
  {
    id: 99,
    question: "Which theory of lunar origin states that the Moon was formed elsewhere and then captured by Earth's gravity?",
    options: ["Fission Theory", "Capture Theory", "Co-accretion Theory", "Condensation Theory"],
    answer: 1
  },
  {
    id: 100,
    question: "What is the name of the NASA spacecraft mission that crashed a rocket stage into the Cabeus crater to detect water in 2009?",
    options: ["LRO", "LCROSS", "GRAIL", "Deep Impact"],
    answer: 1
  }
];

// Combine and export or make globally available in window object
window.MOON_QUIZ_QUESTIONS = {
  junior: JUNIOR_QUESTIONS,
  senior: SENIOR_QUESTIONS
};
