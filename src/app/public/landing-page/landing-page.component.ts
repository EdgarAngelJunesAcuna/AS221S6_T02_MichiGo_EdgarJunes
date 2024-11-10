import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs'; // Para manejar las suscripciones

interface Benefit {
  title: string;
  description: string;
  image: string; // Campo de imagen agregado
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  currentLang = 'en'; // Idioma por defecto: inglés
  isDropdownOpen = false; // Estado del menú desplegable
  isDarkTheme: boolean = false; // Estado del tema oscuro/claro
  currentSlideIndex = 0; // Controlar el índice del carrusel
  slideInterval: any; // Variable para almacenar el intervalo del carrusel automático
  isModalOpen = false; // Estado del modal de beneficios
  isTeamModalOpen = false; // Estado del modal del equipo
  modalContent: Benefit | null = null; // Contenido del modal con el tipo Benefit
  private translationSubscription: Subscription | null = null; // Para manejar la suscripción de traducción

  benefits: { [key: string]: Benefit } = {}; // Objeto de beneficios con título, descripción e imagen

  // Características de la plataforma con desplegables
  features = [
    {
      title: 'FEATURES.FEATURE_1_TITLE',
      description: 'FEATURES.FEATURE_1_DESC',
      open: false,
    },
    {
      title: 'FEATURES.FEATURE_2_TITLE',
      description: 'FEATURES.FEATURE_2_DESC',
      open: false,
    },
    {
      title: 'FEATURES.FEATURE_3_TITLE',
      description: 'FEATURES.FEATURE_3_DESC',
      open: false,
    },
    {
      title: 'FEATURES.FEATURE_4_TITLE',
      description: 'FEATURES.FEATURE_4_DESC',
      open: false,
    }
  ];

  // Miembros del equipo para el modal
  teamMembers: TeamMember[] = [
    {
      name: 'Guerrero',
      role: 'Develop',
      image: '/assets/BrandonGuerrero.png',
    },
    {
      name: 'Rodriguez',
      role: 'Develop',
      image: '/assets/AnghelaRodriguez .png',
    },
    {
      name: 'Junes',
      role: 'Develop',
      image: '/assets/EdgarJunes.png',
    }
  ];

  constructor(private translate: TranslateService) {
    // Establecer el idioma predeterminado como inglés
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);

    // Cargar el tema guardado en localStorage
    const theme = localStorage.getItem('theme') || 'light';
    this.isDarkTheme = theme === 'dark'; // Actualizar el estado del tema
    this.setTheme(theme); // Aplicar el tema
  }

  ngOnInit() {
    // Iniciar el carrusel de forma automática
    this.startAutoSlide();

    // Inicializar las traducciones para los beneficios
    this.loadBenefits();

    // Suscribirse a los cambios de idioma para actualizar los textos
    this.translationSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadBenefits(); // Recargar los beneficios cuando cambie el idioma
    });
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruya
    this.stopAutoSlide();

    // Desuscribirse de la suscripción de traducción
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }

  // Método para cargar o recargar los beneficios con las traducciones
  loadBenefits() {
    this.translate.get([
      'BENEFITS.BENEFIT_1_TITLE',
      'BENEFITS.BENEFIT_1_DESC',
      'BENEFITS.BENEFIT_2_TITLE',
      'BENEFITS.BENEFIT_2_DESC',
      'BENEFITS.BENEFIT_3_TITLE',
      'BENEFITS.BENEFIT_3_DESC',
      'BENEFITS.BENEFIT_4_TITLE',
      'BENEFITS.BENEFIT_4_DESC'
    ]).subscribe(translations => {
      this.benefits = {
        benefit1: {
          title: translations['BENEFITS.BENEFIT_1_TITLE'],
          description: translations['BENEFITS.BENEFIT_1_DESC'],
          image: 'https://media4.giphy.com/media/hZcmge7jsCMhO/giphy.gif?cid=ecf05e474522cee3a69fb43da42c4c6d0d9f493b75a43b70&rid=giphy.gif' // Imagen para el beneficio 1
        },
        benefit2: {
          title: translations['BENEFITS.BENEFIT_2_TITLE'],
          description: translations['BENEFITS.BENEFIT_2_DESC'],
          image: 'https://media4.giphy.com/media/hZcmge7jsCMhO/giphy.gif?cid=ecf05e474522cee3a69fb43da42c4c6d0d9f493b75a43b70&rid=giphy.gif' // Imagen para el beneficio 2
        },
        benefit3: {
          title: translations['BENEFITS.BENEFIT_3_TITLE'],
          description: translations['BENEFITS.BENEFIT_3_DESC'],
          image: 'https://media4.giphy.com/media/hZcmge7jsCMhO/giphy.gif?cid=ecf05e474522cee3a69fb43da42c4c6d0d9f493b75a43b70&rid=giphy.gif' // Imagen para el beneficio 3
        },
        benefit4: {
          title: translations['BENEFITS.BENEFIT_4_TITLE'],
          description: translations['BENEFITS.BENEFIT_4_DESC'],
          image: 'https://media4.giphy.com/media/hZcmge7jsCMhO/giphy.gif?cid=ecf05e474522cee3a69fb43da42c4c6d0d9f493b75a43b70&rid=giphy.gif' // Imagen para el beneficio 4
        }
      };
    });
  }

  // Cambiar el idioma según la selección en el dropdown
  switchLanguage(lang: string) {
    this.translate.use(lang);  // Cambiar idioma
    this.currentLang = lang;   // Actualizar la variable
  }

  // Método para alternar el tema oscuro/claro
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme; // Cambiar el estado del tema
    const theme = this.isDarkTheme ? 'dark' : 'light';
    this.setTheme(theme);
  }

  // Aplicar el tema y guardarlo en localStorage
  setTheme(theme: string) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme); // Guardar preferencia de tema
  }

  // Estado abierto/cerrado del dropdown de idiomas
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Funciones del carrusel
  nextSlide() {
    const slides = document.getElementById('carouselSlides');
    const totalSlides = slides?.children.length || 0;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % totalSlides;
    this.updateCarousel();
  }

  prevSlide() {
    const slides = document.getElementById('carouselSlides');
    const totalSlides = slides?.children.length || 0;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + totalSlides) % totalSlides;
    this.updateCarousel();
  }

  updateCarousel() {
    const slides = document.getElementById('carouselSlides');
    if (slides) {
      slides.style.transform = `translateX(-${this.currentSlideIndex * slides.clientWidth}px)`;
    }
  }

  // Auto-slide para el carrusel (opcional)
  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambia cada 5 segundos automáticamente
  }

  // Detener el auto-slide
  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  // Manejar la interacción manual con los controles del carrusel
  handleControlClick(direction: 'next' | 'prev') {
    this.stopAutoSlide(); // Detener el auto-slide al hacer clic en un control
    if (direction === 'next') {
      this.nextSlide();
    } else {
      this.prevSlide();
    }
    this.startAutoSlide(); // Reiniciar el auto-slide después de la interacción
  }

  // Abrir el modal con el contenido del beneficio
  openModal(benefitId: keyof typeof this.benefits) {
    this.modalContent = this.benefits[benefitId];
    this.isModalOpen = true;
  }

  // Cerrar el modal
  closeModal() {
    this.isModalOpen = false;
    this.modalContent = null;
  }

  // Abrir el modal del equipo
  openTeamModal() {
    this.isTeamModalOpen = true;
  }

  // Cerrar el modal del equipo
  closeTeamModal() {
    this.isTeamModalOpen = false;
  }

  // Alternar las características desplegables
  toggleFeature(index: number) {
    this.features[index].open = !this.features[index].open;
  }
}
