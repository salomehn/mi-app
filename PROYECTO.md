# Granja Virtual Interactiva 3D

Documento de visión, diseño y especificaciones técnicas de la aplicación de granja virtual interactiva en 3D.

---

## 1. Qué hace la app
La aplicación es una experiencia interactiva en 3D de estilo *cozy game* (juego relajante) ambientada en una granja virtual viva, acogedora y serena. Su propósito es ofrecer un espacio lúdico y visualmente reconfortante donde la persona puede sumergirse en un pequeño mundo campestre tipo diorama, contemplar e interactuar con animales adorables en sus respectivos corrales, alimentarlos y disfrutar de un entorno pacífico sin presiones, temporizadores ni objetivos frustrantes.

El proyecto está concebido con un alcance contenido, modular y escalable, diseñado y modelado directamente en Blender mediante la integración con Antigravity y Blender MCP, optimizado para renderizado ágil en navegadores web (WebGL / Three.js).

---

## 2. Quién la usa
* **Público objetivo:** Todo público y jugadores casuales.
* **Perfil de usuario:** Personas de cualquier edad interesadas en juegos relajantes (*cozy games*), dioramas interactivos o simulaciones tranquilas, que buscan pausas reconfortantes o disfrutan del modelado y la interacción tierna con animales en entornos caricaturescos.
* **Nivel de accesibilidad:** Muy alto; diseñado con controles simples e intuitivos que no requieren habilidades previas de videojuegos.

---

## 3. Qué elementos 3D tendrá y con qué estética

### Estética y dirección de arte
* **Estilo general:** *Low poly* tierno, caricaturesco y minimalista.
* **Formas:** Geometrías simplificadas con bordes suaves biselados y siluetas redondeadas que transmiten calidez, simpatía y confort visual.
* **Colores y paleta:** Colores pastel alegres combinados armónicamente con tonos tierra cálidos, evitando saturaciones estridentes.
* **Materiales y sombreado:** Materiales basados en `Principled BSDF` limpios, mates (*roughness* alta $\sim 0.75 - 0.90$, sin nodos complejos ni texturas pesadas), con colores de visualización (*diffuse color*) sincronizados para compatibilidad total con vistas *Solid* y *Material Preview*.
* **Iluminación y atmósfera:** Luz cálida principal (*SunLight*) combinada con luz de relleno fría (*FillLight*) sobre un fondo oscuro pizarra neutro que realza el contraste y la legibilidad de cada modelo.
* **Optimización web:** Menos de 2.000 triángulos por objeto, garantizando alto rendimiento en navegadores.

### Elementos del entorno y escenografía
1. **Terreno base de diorama (`Terreno_Pasto`):**
   * Plataforma cuadrada ampliada de $26 \times 26\text{ metros}$ con bordes redondeados y base inferior de tierra/sustrato visible (`Mat_Grass` y `Mat_Subsoil`).
2. **Red de caminos de tierra (`Camino_Tierra`):**
   * Red de senderos de arcilla/tierra cálida (`Mat_Dirt`) contenidos estrictamente dentro del terreno (con amplios márgenes verdes hasta los bordes), conectando la entrada sur, la plaza central, las puertas de cada corral y el granero.
3. **Granero Rojo (`Granero_Rojo`):**
   * Granero clásico americano con paredes rojas cálidas (`Mat_BarnRed`), techo abuhardillado con alero (`Mat_BarnRoof`), puertas dobles frontales con cruces en 'X' blancas (`Mat_BarnWhite`), ventana de ático y veleta/cúpula superior.
4. **Corrales individuales con cercas de madera rústica:**
   * Cada tipo de animal cuenta con su propia cerca independiente con postes verticales redondeados, travesaños horizontales dobles y puerta de acceso funcional:
     * **`Cerca_Vacas`** (Noroeste, $6.0 \times 6.0\text{ m}$): Alberga a la vaca y su comedero.
     * **`Cerca_Cerdos`** (Suroeste, $6.0 \times 5.5\text{ m}$): Alberga al cerdito.
     * **`Cerca_Ovejas`** (Sureste, $6.0 \times 5.5\text{ m}$): Alberga a la oveja.
     * **`Cerca_Gallinas`** (Este, $5.0 \times 5.0\text{ m}$): Alberga a la gallina junto al granero.
5. **Mobiliario y decoración adicional:**
   * **`Pacas_Heno`:** Conjunto de fardos de paja dorada (`Mat_Hay`) con correas de amarre junto al granero.
   * **`Comedero`:** Comedero de madera con sección de paja para alimento y bebedero con agua fresca (`Mat_Water`).
   * **Árboles (`Arbol_1` a `Arbol_6`):** 6 árboles perimetrales con troncos de madera rústica y copas esféricas facetadas de follaje verde suave (`Mat_Leaves`).
   * **`Flores`:** Grupos de margaritas y tulipanes silvestres de colores pastel (blanco, amarillo, rosa, rojo) bordeando los caminos y cercas.

### Animales (Modelados en 3D con estilo tierno y proporcionado)
* **Vaca (`Vaca`):**
  * Cuerpo cilíndrico regordete blanco con manchas negras redondeadas (`Mat_CowWhite`, `Mat_CowBlack`), hocico rosado redondeado con fosas nasales, cuernitos beige, orejas caídas, cuatro patitas con pezuñas negras, ubre rosada y colita con mechón.
* **Cerdo (`Cerdo`):**
  * Silueta regordeta en tono rosado suave (`Mat_PigPink`), cabeza cúbica biselada, trompa 3D cilíndrica prominente con orificios nasales (`Mat_PigSnout`), dos ojitos negros esféricos definidos con relieve frontal (`Mat_PigEyes`), orejas caídas y colita en espiral.
* **Oveja (`Oveja`):**
  * Cuerpo redondeado y esponjoso tipo nube con corona superior y colita de algodón (`Mat_SheepWool`), cabeza dulce y redondeada adelantada en tono toffee/avellana cálido (`Mat_SheepSkinCute`), ojos grandes alineados con brillo de mirada, orejas suaves alargadas con interior rosado visibles a los costados, y cuatro patas cilíndricas firmes y estables.
* **Gallina (`Gallina`):**
  * Cuerpo compacto y rechoncho en tono crema (`Mat_ChickenWhite`), cresta y barbilla de color rojo vivo (`Mat_ChickenRed`), pico y patitas anaranjadas (`Mat_BeakOrange`), alitas recogidas y plumas de cola erguidas.

---

## 4. Qué ve la persona en pantalla
* **Cámara libre orbital (`MainCamera`):**
  * Control de cámara 3D para orbitar $360^\circ$ alrededor del diorama, hacer zoom para apreciar de cerca a cada animal o alejarse para contemplar la granja completa.
* **Composición centrada:**
  * El diorama completo de $26\text{ m}$ centrado en pantalla, con iluminación equilibrada y sombras suaves.
* **Interfaz de usuario (HUD minimalista):**
  * Pantalla despejada para máxima inmersión visual.
  * Puntero o indicador sutil al seleccionar animales o elementos interactivos.
  * Acciones contextuales discretas en esquinas (por ejemplo, seleccionar comida para alimentar).

---

## 5. Qué puede hacer
* **Explorar libremente:**
  * Navegar e inspeccionar cada rincón de la granja y los 4 corrales usando la cámara orbital.
* **Observar el comportamiento:**
  * Contemplar las poses y animaciones tranquilas de cada animal en su espacio delimitado.
* **Alimentar a los animales:**
  * Seleccionar comida adecuada y ofrecerla en los comederos o directamente a los animales para ver sus reacciones felices.
* **Escuchar sonidos característicos:**
  * Activar tiernos efectos sonoros al interactuar con cada animal (mugidos de la vaca, gruñidos suaves del cerdito, balidos de la oveja y cacareos de la gallina).

---

## 6. Qué se comparte entre usuarios
* **Alcance actual:**
  * **Experiencia 100% individual y local (offline).**
  * No requiere internet, cuentas de usuario ni servidores en esta fase inicial, garantizando un desarrollo ágil, ligero y sin fricciones técnicas.

---

## 7. Estado del archivo de Blender
* **Archivo de proyecto:** `granja_virtual.blend` (guardado y sincronizado).
* **Ruta local:** `/Users/salome/Documents/mi-app/granja_virtual.blend`
* **Todos los modelos listos para revisión y futura exportación (glTF/GLB).**
