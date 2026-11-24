// Los 12 gnomos (decisión de José, 2026-11-16) y sus frases.
// Frases: BORRADOR de CC; José añade refranes e historia local. Pasan el filtro de palabras prohibidas.
// Ilustraciones: `npm run gnomos` convierte contenido/gnomos/<id>-cromo.png y <id>-foto.png a WebP;
// los gnomos sin las dos imágenes muestran el hueco «Ilustración pendiente».

// Fechas de las Jornadas (el Gran Setero solo sale estos días). Se actualizan cada año.
export const JORNADAS = [{ desde: '2026-11-27', hasta: '2026-11-28' }];

export const GNOMOS = [
  { id: 'cronista', nombre: 'el Cronista', rareza: 'comun', frases: [
    'Apunto todo lo que pasa en este monte. Hoy, tu visita.',
    'Hace muchos años, por estas mismas sendas, ya andaban buscando setas tus abuelos.',
    'Una foto vale más que mil apuntes. Bueno… casi.',
    'Cada otoño el monte escribe una página nueva. Tú acabas de leer un trocito.'
  ] },
  { id: 'abuela-refranera', nombre: 'la Abuela Refranera', rareza: 'comun', frases: [
    'Seta que no conoces, déjala donde está.',
    'Quien mira despacio, ve el doble.',
    'Otoño lluvioso, monte generoso.',
    'Más vale preguntar una vez que lamentarlo toda la vida.'
  ] },
  { id: 'grunon', nombre: 'el Gruñón', rareza: 'comun', frases: [
    'Hmpf. Otra foto. Bueno, vale, ha quedado bonita.',
    'Las setas no se tocan sin saber, que luego todo son lamentos.',
    'No pises el musgo, que tarda años en crecer.',
    'Que conste que me alegro de verte. Un poco.'
  ] },
  { id: 'naturalista', nombre: 'la Naturalista', rareza: 'comun', frases: [
    'Mira debajo del sombrero: láminas, poros o pinchos. ¡Cada una es un mundo!',
    'Las setas son el fruto de un hongo que vive bajo tierra, enredado con las raíces de los árboles.',
    'La encina y algunos hongos se ayudan: él le da agua y ella, azúcares.',
    'Fíjate también en el olor y en el sitio donde sale. Son pistas.'
  ] },
  { id: 'chiquillo', nombre: 'el Chiquillo', rareza: 'comun', frases: [
    '¡Te he visto! ¿Jugamos a buscar setas raras?',
    '¡Esa tiene forma de paraguas! Pero no se toca, ¿eh?',
    'Yo ya llevo un montón en mi Micodex. ¿Y tú?',
    '¡Corre, que por allí he visto otra!'
  ] },
  { id: 'pastora', nombre: 'la Pastora', rareza: 'comun', frases: [
    'Por estas veredas paso cada día con el ganado. Las conozco como mi casa.',
    'Las ovejas saben qué hierba pisar. Aprende de ellas: mira antes de tocar.',
    'Cuando refresca y llueve, el monte se llena de sorpresas.',
    'Deja las cancelas como las encuentres, que el ganado se escapa.'
  ] },
  { id: 'despistao', nombre: 'el Despistao', rareza: 'comun', frases: [
    '¿Esto es Saceruela? ¡Uy, pues sí! Menos mal.',
    'Me he perdido tres veces esta mañana. Pero he visto setas preciosas.',
    'Un consejo: no te alejes del grupo. Te lo digo yo, que sé de lo que hablo.',
    '¿Dónde dejé mi gorro? Ah, que lo llevo puesto.'
  ] },
  { id: 'cestera', nombre: 'la Cestera', rareza: 'comun', frases: [
    'Las cestas de mimbre dejan respirar lo que llevas y van soltando esporas por el camino.',
    'Para el juego basta una foto. Si recoges, con navaja, en cesta y respetando la normativa.',
    'Una buena cesta dura años. Un monte bien cuidado, siglos.',
    'Estas manos han trenzado más cestas que setas hay en la sierra.'
  ] },
  { id: 'lucera', nombre: 'la Lucera', rareza: 'raro', soloNoche: true, frases: [
    'Solo salgo cuando se esconde el sol. Qué suerte has tenido.',
    'De noche el monte habla bajito. Hay que saber escuchar.',
    'Mi farol no es para buscar setas: es para que nadie se pierda.',
    'Vuelve a casa con cuidado. Yo te alumbro el camino.'
  ] },
  { id: 'guarda-del-monte', nombre: 'el Guarda del Monte', rareza: 'raro', frases: [
    'Cuido de este monte para que dentro de cien años siga igual de vivo.',
    'Respeta las normas de recolección: son para que haya setas todos los años.',
    'Si ves un fuego o algo raro en el monte, llama al 112.',
    'Lo mejor que te puedes llevar del monte es una buena foto y ganas de volver.'
  ] },
  { id: 'dama-de-la-dehesa', nombre: 'la Dama de la Dehesa', rareza: 'raro', frases: [
    'Bienvenida, bienvenido a mi dehesa. Pocos me encuentran.',
    'Las encinas de esta dehesa tienen más años que todos nosotros juntos.',
    'La dehesa la hicieron entre la gente y el monte, con mucha paciencia.',
    'Cuida lo que ves hoy, que es herencia de mañana.'
  ] },
  { id: 'gran-setero', nombre: 'el Gran Setero', rareza: 'legendario', frases: [
    'Solo aparezco en las Jornadas. Hoy es un día especial, y tú también.',
    'Llevo más otoños en esta sierra de los que puedo contar. Sé una cosa: el que sabe, pregunta.',
    'La mejor seta es la que dejas en el monte para que otros la vean.',
    'Ante la duda, a la mesa de los micólogos. Así lo hacían los sabios.'
  ] }
];

export const RAREZA_TEXTO = { comun: 'Común', raro: 'Raro', legendario: 'Legendario' };
export const gnomo = (id) => GNOMOS.find((g) => g.id === id);
