import type { Metadata } from 'next'
import { TemplateGallery } from '@/features/templates/components/TemplateGallery'

export const metadata: Metadata = { title: 'Plantillas — Forma', description: 'Explorá plantillas para estudios creativos, restaurantes y servicios profesionales. Vistas completas sin iniciar sesión.' }
export default function Templates() { return <TemplateGallery /> }
