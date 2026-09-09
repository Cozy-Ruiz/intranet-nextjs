'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

type IncidenciaTransporte = {
  id: number;
  codigo: string;
  incidencia: string;
};

type TransporteIncidenciasMap = Record<number, number[]>;
  
type Carguero = {
  id: number;
  carguero: string;
};

type CatalogoAduana = {
  aduana: string;
};

type CatalogoAlmacen = {
  almacen: string;
};

type RegistroCarguero = {
  id: number;
  carguero_id: number;
  carguero: string;
  eta: string;
  llegada_real: string;
  ultima_charola: string;
  aduana?: string;
  almacen?: string;
  dodas_asignados: number;
};

type Incidencia = {
  id: number;
  codigo: string;
  incidencia: string;
};

type Doda = {
  doda: string;
  caat: string;
  fecha_cruce: string;
  nombreTransportista: string;
  pedimentos?: string[];
};

type Transporte = {
  transporte_id: number;
  carguero_id: number;
  doda: string;
}

type RegistroTransporte = {
  transporte_id: number;
  carguero_id: number;
  doda: string;
  caat: string;
  nombreTransportista: string;
  fecha_cruce: string;
  hora_limite?: string;
  destino?: string;
  pedimentos?: string[];
  incidencias?: IncidenciaTransporte[];
};

type CatalogoDestino = {
  destino: string;
  hora_limite: string;
};

const emptyCargueroForm = {
  carguero_id: '',
  eta: '',
  llegada_real: '',
  ultima_charola: '',
  aduana: '',
  almacen: '',
};

const toDateTimeLocalValue = (value: string) => {
  if (!value) return '';

  const normalizedValue = value.replace(' ', 'T');
  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function TableroCargueros() {
    
  const [catalogoCargueros, setCatalogoCargueros] = useState<Carguero[]>([]);
  const [catalogoAduanas, setCatalogoAduanas] = useState<CatalogoAduana[]>([]);
  const [catalogoAlmacenes, setCatalogoAlmacenes] = useState<CatalogoAlmacen[]>([]);
  const [cargueros, setCargueros] = useState<RegistroCarguero[]>([]);
  const [catalogoIncidencias, setCatalogoIncidencias] = useState<Incidencia[]>([]);
  const [selectedIncidencias, setSelectedIncidencias] = useState<number[]>([]);
  const [incidenciasMap, setIncidenciasMap] = useState<Record<number, number[]>>({});
  const [selectedCarguero, setSelectedCarguero] = useState<RegistroCarguero | null>(null);
  const [editingIncidencias, setEditingIncidencias] = useState(false);
  const [showDodaSearch, setShowDodaSearch] = useState(false);
  const [dodaSearchDesde, setDodaSearchDesde] = useState('');
  const [dodaSearchHasta, setDodaSearchHasta] = useState('');
  const [transportesCarguero, setTransportesCarguero] = useState<RegistroTransporte[]>([]);
  const [dodasDisponibles, setDodasDisponibles] = useState<Doda[]>([]);
  const [catalogoDestinos, setCatalogoDestinos] = useState<CatalogoDestino[]>([]);
  const [selectedDodasFromSearch, setSelectedDodasFromSearch] = useState<string[]>([]);
  const [showDestinoModal, setShowDestinoModal] = useState(false);
  const [selectedDodaDestinos, setSelectedDodaDestinos] = useState<Record<string, string>>({});
  const [destinoError, setDestinoError] = useState<string | null>(null);
  const [newCarguero, setNewCarguero] = useState(emptyCargueroForm);
  const [editCarguero, setEditCarguero] = useState(emptyCargueroForm);
  const [showEditCarguero, setShowEditCarguero] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAlta, setShowAlta] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDesde, setExportDesde] = useState('');
  const [exportHasta, setExportHasta] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);


  ////
  const [catalogoIncidenciasTransporte, setCatalogoIncidenciasTransporte] = useState<IncidenciaTransporte[]>([]);
  const [incidenciasTransporteMap, setIncidenciasTransporteMap] = useState<TransporteIncidenciasMap>({});
  const [editingTransporteId, setEditingTransporteId] = useState<number | null>(null);
  const [selectedIncidenciasTransporte, setSelectedIncidenciasTransporte] = useState<number[]>([]);

  // Catálogo de incidencias de transporte
  const fetchCatalogoIncidenciasTransporte = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-incidencias-transporte');
      if (!response.ok) throw new Error('No se pudo cargar el catálogo de incidencias de transporte');
      const data = await response.json();
      setCatalogoIncidenciasTransporte(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error cargando incidencias de transporte:', err);
    }
  };

  // Incidencias por transporte
  const fetchIncidenciasPorTransporte = async (transporteId: number): Promise<number[]> => {
    try {
      const response = await fetch(`/backend/kpi/incidencias-transporte?transporteId=${transporteId}`);
      if (!response.ok) return [];
      const data = await response.json();
      const ids = Array.isArray(data.data) ? data.data.map((i: any) => i.id) : [];
      setIncidenciasTransporteMap((prev) => ({ ...prev, [transporteId]: ids }));
      return ids;
    } catch (e) {
      console.error('Error fetching incidencias para transporte', e);
      return [];
    }
  };

  // UI: abrir edición de incidencias de transporte
  const handleEditTransporteIncidencias = async (transporteId: number) => {
    const transporte = transportesCarguero.find((item) => item.transporte_id === transporteId);
    let ids: number[] = transporte?.incidencias?.map((inc) => inc.id) ?? [];
    if (!ids || ids.length === 0) {
      ids = await fetchIncidenciasPorTransporte(transporteId);
    }
    setEditingTransporteId(transporteId);
    setSelectedIncidenciasTransporte(ids);
  };

  // UI: cerrar edición
  const handleCloseTransporteIncidencias = () => {
    setEditingTransporteId(null);
    setSelectedIncidenciasTransporte([]);
  };

  // UI: cambio de selección
  const handleIncidenciasTransporteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
    setSelectedIncidenciasTransporte(values);
  };

  // Guardar incidencias de transporte
  const handleSaveTransporteIncidencias = async () => {
    if (editingTransporteId == null) return;
    try {
      const res = await fetch('/backend/kpi/transporte-incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporte_id: editingTransporteId, incidencias: selectedIncidenciasTransporte }),
      });
      if (!res.ok) throw new Error('Error guardando incidencias de transporte');

      const incidencias = selectedIncidenciasTransporte.map((id) => {
        const catalogo = catalogoIncidenciasTransporte.find((inc) => inc.id === id);
        return catalogo ? { id: catalogo.id, codigo: catalogo.codigo, incidencia: catalogo.incidencia } : { id, codigo: '', incidencia: '' };
      });

      setIncidenciasTransporteMap((prev) => ({ ...prev, [editingTransporteId]: selectedIncidenciasTransporte }));
      setTransportesCarguero((prev) => prev.map((transporte) =>
        transporte.transporte_id === editingTransporteId
          ? { ...transporte, incidencias }
          : transporte
      ));

      setEditingTransporteId(null);
      setSelectedIncidenciasTransporte([]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCatalogoCargueros = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-cargueros');
      if (!response.ok) {
        throw new Error('No se pudo cargar catalogo de cargueros');
      }

      const data = await response.json();
      const lista: Carguero[] = Array.isArray(data.data) ? data.data : [];
      setCatalogoCargueros(lista);
    } catch (err) {
      console.error('Error cargando cargueros:', err);
    }
  };

  const fetchCatalogoIncidencias = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-incidencias');
      if (!response.ok) {
        throw new Error('No se pudo cargar el catálogo de incidencias');
      }

      const data = await response.json();
      const lista: Incidencia[] = Array.isArray(data.data) ? data.data : [];
      setCatalogoIncidencias(lista);
    } catch (err) {
      console.error('Error cargando incidencias:', err);
    }
  };

  const fetchCatalogoAduanas = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-aduanas');
      if (!response.ok) {
        throw new Error('No se pudo cargar el catálogo de aduanas');
      }
      const data = await response.json();
      setCatalogoAduanas(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error cargando aduanas:', err);
    }
  };

  const fetchCatalogoAlmacenes = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-almacenes');
      if (!response.ok) {
        throw new Error('No se pudo cargar el catálogo de almacenes');
      }
      const data = await response.json();
      setCatalogoAlmacenes(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error cargando almacenes:', err);
    }
  };

  const fetchCargueros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/backend/kpi/registros-cargueros');
      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de cargueros');
      }

      const data = await response.json();
      const lista: RegistroCarguero[] = Array.isArray(data.data) ? data.data : [];
      setCargueros(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransportesCarguero = async (cargueroId?: number) => {
    try {
      const params = new URLSearchParams();
      if (cargueroId) params.set('cargueroId', String(cargueroId));
      const queryString = params.toString();
      const res = await fetch(`/backend/kpi/transportes-carguero${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) {
        throw new Error('No se pudo cargar la lista de transportes del carguero');
      }
      const data = await res.json();
      setTransportesCarguero(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error cargando DODAS del carguero:', error);
      setTransportesCarguero([]);
    }
  };

  const handleToggleEditIncidencias = () => {
    setEditingIncidencias((s) => !s);
  };

  const handleSaveIncidencias = async () => {
    if (!selectedCarguero) return;
    try {
      const res = await fetch('/backend/kpi/carguero-incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carguero_id: selectedCarguero.id, incidencias: selectedIncidencias }),
      });
      if (!res.ok) throw new Error('Error guardando incidencias');
      setIncidenciasMap((prev) => ({ ...prev, [selectedCarguero.id]: selectedIncidencias }));
      setEditingIncidencias(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseIncidencias = () => {
    // reset selections to saved state
    if (selectedCarguero) {
      setSelectedIncidencias(incidenciasMap[selectedCarguero.id] ?? []);
    } else {
      setSelectedIncidencias([]);
    }
    setEditingIncidencias(false);
  };

  const handleToggleDodaSearch = () => {
    setShowDodaSearch((prev) => !prev);
  };

  const handleSearchDodas = async () => {
    if (!dodaSearchDesde || !dodaSearchHasta) {
      setError('Por favor selecciona las fechas desde y hasta');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set('desde', dodaSearchDesde);
      params.set('hasta', dodaSearchHasta);
      
      const res = await fetch(`/backend/kpi/dodas-disponibles?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Error en la búsqueda de DODAS');
      }
      
      const data = await res.json();
      setDodasDisponibles(Array.isArray(data.data) ? data.data : []);
      setSelectedDodasFromSearch([]);
    } catch (e) {
      console.error('Error al buscar DODAS disponibles:', e);
      setDodasDisponibles([]);
      setSelectedDodasFromSearch([]);
      setError('Error al buscar DODAS disponibles');
    }
  };

  const handleToggleDodaSelection = (doda: string) => {
    setSelectedDodasFromSearch((prev) =>
      prev.includes(doda) ? prev.filter((d) => d !== doda) : [...prev, doda]
    );
  };

  const fetchCatalogoDestinos = async () => {
    try {
      const response = await fetch('/backend/kpi/catalogo-destinos');
      if (!response.ok) throw new Error('No se pudo cargar el catálogo de destinos');
      const data = await response.json();
      setCatalogoDestinos(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error cargando destinos:', err);
      setCatalogoDestinos([]);
    }
  };

  const handleOpenDestinoModal = async () => {
    if (!selectedCarguero || selectedDodasFromSearch.length === 0) {
      setError('Selecciona al menos un DODA antes de registrar.');
      return;
    }
    setDestinoError(null);
    if (catalogoDestinos.length === 0) {
      await fetchCatalogoDestinos();
    }
    setSelectedDodaDestinos((prev) => {
      const next: Record<string, string> = { ...prev };
      selectedDodasFromSearch.forEach((doda) => {
        if (!next[doda]) next[doda] = '';
      });
      return next;
    });
    setShowDestinoModal(true);
  };

  const handleDestinoChange = (doda: string, destino: string) => {
    setSelectedDodaDestinos((prev) => ({ ...prev, [doda]: destino }));
  };

  const handleSaveCargueroDodasFromSearch = async () => {
    if (!selectedCarguero || selectedDodasFromSearch.length === 0) {
      setError('Por favor selecciona al menos un DODA');
      return;
    }

    const missingDestino = selectedDodasFromSearch.find((doda) => !selectedDodaDestinos[doda]);
    if (missingDestino) {
      setDestinoError('Asigna un destino para cada DODA antes de guardar.');
      return;
    }

    try {
      setSaving(true);
      const transportes = selectedDodasFromSearch.map((doda) => ({
        doda,
        destino: selectedDodaDestinos[doda],
      }));

      const res = await fetch('/backend/kpi/carguero-dodas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carguero_id: selectedCarguero.id, transportes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Error al guardar DODAS');
      }

      // Actualizar la lista de DODAs del carguero
      fetchTransportesCarguero(selectedCarguero.id);

      setMessage('DODAS guardadas correctamente');
      setSelectedDodasFromSearch([]);
      setSelectedDodaDestinos({});
      //setDodasDisponibles([]);
      //setShowDodaSearch(false);
      setShowDestinoModal(false);
      //setDodaSearchDesde('');
      //setDodaSearchHasta('');
      if (dodaSearchDesde && dodaSearchHasta) {
        handleSearchDodas();
      }

      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error('Error al guardar DODAS:', e);
      setError(e instanceof Error ? e.message : 'Error al guardar DODAS');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditCarguero = () => {
    if (!selectedCarguero) return;

    setError(null);
    setMessage(null);
    setShowAlta(false);
    setShowEditCarguero(true);
    setEditCarguero({
      carguero_id: String(selectedCarguero.carguero_id),
      eta: toDateTimeLocalValue(selectedCarguero.eta),
      llegada_real: toDateTimeLocalValue(selectedCarguero.llegada_real),
      ultima_charola: toDateTimeLocalValue(selectedCarguero.ultima_charola),
      aduana: selectedCarguero.aduana || '',
      almacen: selectedCarguero.almacen || '',
    });
  };

  const handleSubmitEditCarguero = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCarguero) return;

    if (!editCarguero.carguero_id || !editCarguero.eta || !editCarguero.llegada_real || !editCarguero.ultima_charola || !editCarguero.aduana || !editCarguero.almacen) {
      setError('Todos los campos son requeridos.');
      return;
    }

    const llegadaDate = new Date(editCarguero.llegada_real);
    const ultimaCharolaDate = new Date(editCarguero.ultima_charola);
    if (isNaN(llegadaDate.getTime()) || isNaN(ultimaCharolaDate.getTime())) {
      setError('Formato de fecha inválido.');
      return;
    }

    if (ultimaCharolaDate < llegadaDate) {
      setError('La fecha de última charola no puede ser anterior a la llegada real.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/backend/kpi/carguero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCarguero.id,
          carguero_id: parseInt(editCarguero.carguero_id),
          eta: editCarguero.eta,
          llegada_real: editCarguero.llegada_real,
          ultima_charola: editCarguero.ultima_charola,
          aduana: editCarguero.aduana,
          almacen: editCarguero.almacen,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo editar el carguero');
      }

      const data = await response.json();
      const updatedCarguero = data.data as RegistroCarguero;

      setSelectedCarguero(updatedCarguero);
      setCargueros((prev) => prev.map((item) => (item.id === updatedCarguero.id ? updatedCarguero : item)));
      setShowEditCarguero(false);
      setEditCarguero({ ...emptyCargueroForm });
      setMessage(`Carguero actualizado correctamente para ${updatedCarguero.carguero}.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCarguero = async () => {
    if (!selectedCarguero) return;

    const confirmed = window.confirm(`¿Deseas eliminar el carguero "${selectedCarguero.carguero}" y todos sus registros asociados?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const res = await fetch('/backend/kpi/carguero', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carguero_id: selectedCarguero.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Error al eliminar el carguero');
      }

      await fetchCargueros();
      setSelectedCarguero(null);
      setTransportesCarguero([]);
      setSelectedIncidencias([]);
      setEditingIncidencias(false);
      setSelectedIncidenciasTransporte([]);
      setEditingTransporteId(null);

      setMessage('Carguero eliminado correctamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error('Error al eliminar carguero:', e);
      setError(e instanceof Error ? e.message : 'Error al eliminar carguero');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransporteCarguero = async (doda: string) => {
    if (!selectedCarguero) return;

    try {
      setSaving(true);
      const res = await fetch('/backend/kpi/transporte-carguero', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carguero_id: selectedCarguero.id, doda }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Error al eliminar transporte del carguero');
      }

      fetchTransportesCarguero(selectedCarguero.id);
      setSelectedDodasFromSearch((prev) => prev.filter((item) => item !== doda));

      if (showDodaSearch && dodaSearchDesde && dodaSearchHasta) {
        handleSearchDodas();
      }

      setMessage('Transporte eliminado correctamente');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error('Error al eliminar transporte:', e);
      setError(e instanceof Error ? e.message : 'Error al eliminar transporte');
    } finally {
      setSaving(false);
    }
  };

  const handleIncidenciasChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!selectedCarguero) return;

    const values = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
    setSelectedIncidencias(values);
    setIncidenciasMap((prev) => ({
      ...prev,
      [selectedCarguero.id]: values,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCarguero.carguero_id || !newCarguero.eta || !newCarguero.llegada_real || !newCarguero.ultima_charola || !newCarguero.aduana || !newCarguero.almacen) {
      setError('Todos los campos son requeridos.');
      return;
    }
    // Validación cliente: ultima_charola no puede ser anterior a llegada_real
    const llegadaDate = new Date(newCarguero.llegada_real);
    const ultimaCharolaDate = new Date(newCarguero.ultima_charola);
    if (isNaN(llegadaDate.getTime()) || isNaN(ultimaCharolaDate.getTime())) {
      setError('Formato de fecha inválido.');
      return;
    }
    if (ultimaCharolaDate < llegadaDate) {
      setError('La fecha de última charola no puede ser anterior a la llegada real.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/backend/kpi/nuevo-carguero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carguero_id: parseInt(newCarguero.carguero_id),
          eta: newCarguero.eta,
          llegada_real: newCarguero.llegada_real,
          ultima_charola: newCarguero.ultima_charola,
          aduana: newCarguero.aduana,
          almacen: newCarguero.almacen,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo dar de alta el carguero');
      }

      const data = await response.json();
      setMessage(`Carguero registrado correctamente para ${data.data.carguero}.`);
      setNewCarguero({ ...emptyCargueroForm });
      setShowAlta(false);
      setSelectedCarguero(data.data);
      setSelectedIncidencias([]);
      fetchCargueros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportError(null);
  };

  const parseExcelDate = (value: string | Date) => {
    if (!value) return '';

    const toExcelSerial = (date: Date) => {
      const excelBase = Date.UTC(1899, 11, 30);
      return (date.getTime() - excelBase) / 86400000;
    };

    if (value instanceof Date) {
      return toExcelSerial(value);
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);

      if (match) {
        const [, year, month, day, hours, minutes, seconds = '00'] = match;
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)));
        return toExcelSerial(date);
      }

      return trimmedValue;
    }

    return value;
  };

  const handleExportCarguerosExcel = async () => {
    
    setExportError(null);

    if (!exportDesde || !exportHasta) {
      setExportError('Selecciona un rango de fechas.');
      return;
    }

    const desdeDate = new Date(exportDesde);
    const hastaDate = new Date(exportHasta);

    if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
      setExportError('Formato de fecha inválido.');
      return;
    }

    if (hastaDate < desdeDate) {
      setExportError('La fecha hasta no puede ser anterior a la fecha desde.');
      return;
    }

    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.set('desde', exportDesde);
      params.set('hasta', exportHasta);

      console.log('Exportando cargueros con parámetros:', params.toString());
      
      //Cargueros
      const responseCargueros = await fetch(`/backend/kpi/cargueros-excel?${params.toString()}`);
      if (!responseCargueros.ok) {
        const data = await responseCargueros.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar cargueros.');
      }
      const cargueros = await responseCargueros.json();
      console.log('Cargueros exportados:', cargueros);
      
      //Transportes
      const responseTransportes = await fetch(`/backend/kpi/transportes-excel?${params.toString()}`);
      if (!responseTransportes.ok) {
        const data = await responseTransportes.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar transportes.');
      }
      const transportes = await responseTransportes.json();
      console.log('Transportes exportados:', transportes);

      //Referencias
      const responseReferencias = await fetch(`/backend/kpi/referencias-excel?${params.toString()}`);
      if (!responseReferencias.ok) {
        const data = await responseReferencias.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar referencias.');
      }
      const referencias = await responseReferencias.json();
      console.log('Referencias exportadas:', referencias);

      //Incidencias Cargueros
      const responseIncidenciasCargueros = await fetch(`/backend/kpi/incidencias-cargueros-excel?${params.toString()}`);
      if (!responseIncidenciasCargueros.ok) {
        const data = await responseIncidenciasCargueros.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar incidencias de cargueros.');
      }
      const incidenciasCargueros = await responseIncidenciasCargueros.json();
      console.log('Incidencias de cargueros exportadas:', incidenciasCargueros);
      
      //Incidencias Transportes
      const responseIncidenciasTransportes = await fetch(`/backend/kpi/incidencias-transportes-excel?${params.toString()}`);
      if (!responseIncidenciasTransportes.ok) {
        const data = await responseIncidenciasTransportes.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar incidencias de transportes.');
      }
      const incidenciasTransportes = await responseIncidenciasTransportes.json();
      console.log('Incidencias de transportes exportadas:', incidenciasTransportes);
      
      
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      //Cargueros
      const Carguerossheet = workbook.addWorksheet('Cargueros');
  
      Carguerossheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Carguero', key: 'carguero', width: 32 },
        { header: 'Aduana', key: 'aduana', width: 18 },
        { header: 'Almacén', key: 'almacen', width: 18 },
        { header: 'ETA', key: 'eta', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        { header: 'Llegada Real', key: 'llegada_real', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        { header: 'Última Charola', key: 'ultima_charola', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
      ];
  
      cargueros.data.forEach((row: any) => {
        Carguerossheet.addRow({
          id: row.id,
          carguero: row.carguero,
          aduana: row.aduana || '',
          almacen: row.almacen || '',
          eta: parseExcelDate(row.eta),
          llegada_real: parseExcelDate(row.llegada_real),
          ultima_charola: parseExcelDate(row.ultima_charola),
        });
      });

      //Transportes
      const transportesSheet = workbook.addWorksheet('Transportes');

      transportesSheet.columns = [
        { header: 'DODA', key: 'doda', width: 24 },
        { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
        { header: 'TRANSPORTE', key: 'transporte_nombre', width: 32 },
        { header: 'DESTINO', key: 'destino', width: 24 },
      ];

      transportes.data.forEach((row: any) => {
        transportesSheet.addRow({
          doda: row.doda ? row.doda.trim() : '',
          carguero_id: row.carguero_id,
          transporte_nombre: row.transporte_nombre || '',
          destino: row.destino || '',
        });
      });

      //Referencias
      const referenciasSheet = workbook.addWorksheet('Referencias');

      referenciasSheet.columns = [
        { header: 'Referencia', key: 'referencia', width: 30 },
        { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
        { header: 'DODA', key: 'doda', width: 24 },
        { header: 'Pedimento', key: 'pedimento', width: 20 },
        { header: 'Aduana', key: 'aduana', width: 18 },
        { header: 'Importador', key: 'importador', width: 32 },
        { header: 'Cadena Comercial', key: 'cadena', width: 20 },
        { header: 'Fecha Pago', key: 'fecha_pago', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        { header: 'Fecha Cruce', key: 'fecha_cruce', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        { header: 'Bultos', key: 'bultos', width: 22 },
        { header: 'Semaforo', key: 'semaforo_1', width: 22 },
        { header: 'Pago Anticipado', key: 'fr', width: 22 },
        { header: 'Profepa', key: 't9', width: 22 },
        { header: 'Permiso automatico', key: 'c1', width: 22 },
        { header: 'Cuenta Aduanera', key: 'cuenta_aduanera', width: 22 },
        { header: 'Tipo Mercancia', key: 'material', width: 22 },
        { header: 'Control Calidad', key: 'control_calidad', width: 22 },
      ];

      for (const row of referencias.data) {

        //Referencia Oracle
        const responseReferenciaOracle = await fetch(`/backend/kpi/referencia-oracle-excel?referencia=${encodeURIComponent(row.referencia)}`);
        if (!responseReferenciaOracle.ok) {
          const data = await responseReferenciaOracle.json().catch(() => null);
          throw new Error(data?.message || 'No se pudo descargar referencia Oracle.');
        }
        const referenciaOracle = await responseReferenciaOracle.json();
        const datosOracle = referenciaOracle?.data?.[0] ?? {};
        console.log('Referencia Oracle exportada:', datosOracle);

        referenciasSheet.addRow({
          referencia: row.referencia,
          carguero_id: row.carguero_id,
          doda: row.doda ? row.doda.trim() : '',
          pedimento: row.pedimento,
          aduana: row.aduana || '',
          importador: row.importador || '',
          cadena: row.cadena || '',
          fecha_pago: parseExcelDate(row.fecha_pago),
          fecha_cruce: parseExcelDate(row.fecha_cruce),
          bultos: datosOracle.BULTOS || '',
          semaforo_1: row.semaforo_1 || '',
          fr: datosOracle.CLAVE || '',
          t9: datosOracle.T9 || '',
          c1: datosOracle.C1 || '',
          cuenta_aduanera: datosOracle.CLAVE_GA || '',
          material: row.material || '',
          control_calidad: '', // Aquí puedes agregar la lógica para obtener el control de calidad si es necesario
        });
      };

      //Incidencias Cargueros
      const incidenciasCarguerosSheet = workbook.addWorksheet('Incidencias Cargueros');

      incidenciasCarguerosSheet.columns = [
        { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
        { header: 'Incidencia', key: 'incidencia', width: 50 },
      ];

      incidenciasCargueros.data.forEach((row: any) => {
        incidenciasCarguerosSheet.addRow({
          carguero_id: row.carguero_id,
          incidencia: row.incidencia
        });
      });

      //Incidencias Transportes
      const incidenciasTransportesSheet = workbook.addWorksheet('Incidencias Transportes');

      incidenciasTransportesSheet.columns = [
        { header: 'DODA', key: 'doda', width: 14 },
        { header: 'Incidencia', key: 'incidencia', width: 50 },
      ];

      incidenciasTransportes.data.forEach((row: any) => {
        incidenciasTransportesSheet.addRow({
          doda: row.doda,
          incidencia: row.incidencia
        });
      });

      // Generar el archivo Excel y descargarlo
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `cargueros_${exportDesde}_${exportHasta}.xlsx`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      handleCloseExportModal();
      
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al descargar el archivo.');
    } finally {
      setExporting(false);
    }
  };
  /*
  const handleExportCarguerosExcel = async () => {
    setExportError(null);

    if (!exportDesde || !exportHasta) {
      setExportError('Selecciona un rango de fechas.');
      return;
    }

    const desdeDate = new Date(exportDesde);
    const hastaDate = new Date(exportHasta);

    if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
      setExportError('Formato de fecha inválido.');
      return;
    }

    if (hastaDate < desdeDate) {
      setExportError('La fecha hasta no puede ser anterior a la fecha desde.');
      return;
    }

    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.set('desde', exportDesde);
      params.set('hasta', exportHasta);

      const response = await fetch(`/backend/kpi/registros-cargueros-excel?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo descargar el archivo.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `cargueros_${exportDesde}_${exportHasta}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      handleCloseExportModal();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al descargar el archivo.');
    } finally {
      setExporting(false);
    }
  };
  */

  const formatDateDifference = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '-';
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const absMs = Math.abs(diffMs);
    const days = Math.floor(absMs / 86_400_000);
    const hours = Math.floor((absMs % 86_400_000) / 3_600_000);
    const minutes = Math.floor((absMs % 3_600_000) / 60_000);
    const parts = [] as string[];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return `${diffMs < 0 ? '-' : ''}${parts.join(' ')}`;
  };

  useEffect(() => {
    fetchCatalogoIncidenciasTransporte();
  }, []);

  useEffect(() => {
    fetchCatalogoCargueros();
    fetchCatalogoIncidencias();
    fetchCatalogoAduanas();
    fetchCatalogoAlmacenes();
    fetchCargueros();
  }, []);

  useEffect(() => {
    if (!selectedCarguero) {
      setSelectedIncidencias([]);
      setTransportesCarguero([]);
      setDodasDisponibles([]);
      setSelectedDodasFromSearch([]);
      setDodaSearchDesde('');
      setDodaSearchHasta('');
      setShowDodaSearch(false);
      setShowEditCarguero(false);
      setEditCarguero({ ...emptyCargueroForm });
      return;
    }

    setSelectedIncidencias(incidenciasMap[selectedCarguero.id] ?? []);
    fetchTransportesCarguero(selectedCarguero.id);
  }, [selectedCarguero, incidenciasMap]);

  useEffect(() => {
    const fetchIncidenciasForSelected = async () => {
      if (!selectedCarguero) return;
      try {
        const res = await fetch(`/backend/kpi/incidencias?cargueroId=${selectedCarguero.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const ids = Array.isArray(data.data) ? data.data.map((i: any) => i.id) : [];
        setIncidenciasMap((prev) => ({ ...prev, [selectedCarguero.id]: ids }));
      } catch (e) {
        console.error('Error fetching incidencias for carguero', e);
      }
    };

    fetchIncidenciasForSelected();
  }, [selectedCarguero]);

  

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Cargueros</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Visualiza todos los cargueros registrados.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-right shadow-sm sm:px-6">
              <p className="text-sm text-slate-500">Total de cargueros</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{cargueros.length}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Lista de cargueros</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlta((prev) => !prev);
                    setShowEditCarguero(false);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                  aria-label={showAlta ? 'Ocultar alta de carguero' : 'Mostrar alta de carguero'}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                  aria-label="Descargar cargueros en Excel"
                  title="Descargar cargueros en Excel"
                >
                  <FiDownload className="h-5 w-5" />
                </button>
                <div className="rounded-3xl bg-sky-100 px-4 py-3 text-sm font-semibold text-sky-700">
                  {loading ? 'Actualizando...' : 'Datos cargados'}
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Carguero</th>
                    <th className="px-4 py-3 font-medium">ETA</th>
                    <th className="px-4 py-3 font-medium">Llegada Real</th>
                    <th className="px-4 py-3 font-medium">Última Charola</th>
                    <th className="px-4 py-3 font-medium">DODAS Asignados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {cargueros.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        No hay cargueros registrados.
                      </td>
                    </tr>
                  ) : (
                    cargueros.map((carguero) => {
                      const isSelected = selectedCarguero?.id === carguero.id;
                      return (
                        <tr
                          key={carguero.id}
                          className={`cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-sky-50' : ''}`}
                          onClick={() => {setSelectedCarguero(carguero); setShowAlta(false); setShowEditCarguero(false);}}
                        >
                          <td className="px-4 py-4 font-medium text-slate-900">{carguero.id}</td>
                          <td className="px-4 py-4 text-slate-700">{carguero.carguero}</td>
                          <td className="px-4 py-4 text-slate-700">
                            {new Date(carguero.eta).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {new Date(carguero.llegada_real).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {new Date(carguero.ultima_charola).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-4 text-center text-slate-700">{carguero.dodas_asignados}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            {showAlta ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Alta de carguero</h2>
                <p className="mt-2 text-sm text-slate-600">Registra un nuevo carguero con sus fechas.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Carguero</label>
                    <select
                      value={newCarguero.carguero_id}
                      onChange={(event) => setNewCarguero({ ...newCarguero, carguero_id: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona un carguero</option>
                      {catalogoCargueros.map((carguero) => (
                        <option key={carguero.id} value={carguero.id}>
                          {carguero.carguero}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">ETA</label>
                    <input
                      type="datetime-local"
                      value={newCarguero.eta}
                      onChange={(event) => setNewCarguero({ ...newCarguero, eta: event.target.value, llegada_real: event.target.value, ultima_charola: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Llegada Real</label>
                    <input
                      type="datetime-local"
                      value={newCarguero.llegada_real}
                      onChange={(event) => setNewCarguero({ ...newCarguero, llegada_real: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Última Charola</label>
                    <input
                      type="datetime-local"
                      value={newCarguero.ultima_charola}
                      onChange={(event) => setNewCarguero({ ...newCarguero, ultima_charola: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Aduana</label>
                    <select
                      value={newCarguero.aduana}
                      onChange={(event) => setNewCarguero({ ...newCarguero, aduana: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona una aduana</option>
                      {catalogoAduanas.map((aduana) => (
                        <option key={aduana.aduana} value={aduana.aduana}>
                          {aduana.aduana}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Almacén</label>
                    <select
                      value={newCarguero.almacen}
                      onChange={(event) => setNewCarguero({ ...newCarguero, almacen: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona un almacén</option>
                      {catalogoAlmacenes.map((almacen) => (
                        <option key={almacen.almacen} value={almacen.almacen}>
                          {almacen.almacen}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !newCarguero.carguero_id || !newCarguero.eta || !newCarguero.llegada_real || !newCarguero.ultima_charola || !newCarguero.aduana || !newCarguero.almacen}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Guardando...' : 'Dar de alta carguero'}
                  </button>

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  ) : null}

                  {message ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {message}
                    </div>
                  ) : null}
                </form>
              </div>
            ) : null}

            {showEditCarguero && selectedCarguero ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Editar carguero</h2>
                    <p className="mt-2 text-sm text-slate-600">Modifica los datos iniciales del carguero seleccionado.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditCarguero(false)}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmitEditCarguero}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Carguero</label>
                    <select
                      value={editCarguero.carguero_id}
                      onChange={(event) => setEditCarguero({ ...editCarguero, carguero_id: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona un carguero</option>
                      {catalogoCargueros.map((carguero) => (
                        <option key={carguero.id} value={carguero.id}>
                          {carguero.carguero}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">ETA</label>
                    <input
                      type="datetime-local"
                      value={editCarguero.eta}
                      onChange={(event) => setEditCarguero({ ...editCarguero, eta: event.target.value, llegada_real: event.target.value, ultima_charola: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Llegada Real</label>
                    <input
                      type="datetime-local"
                      value={editCarguero.llegada_real}
                      onChange={(event) => setEditCarguero({ ...editCarguero, llegada_real: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Última Charola</label>
                    <input
                      type="datetime-local"
                      value={editCarguero.ultima_charola}
                      onChange={(event) => setEditCarguero({ ...editCarguero, ultima_charola: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Aduana</label>
                    <select
                      value={editCarguero.aduana}
                      onChange={(event) => setEditCarguero({ ...editCarguero, aduana: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona una aduana</option>
                      {catalogoAduanas.map((aduana) => (
                        <option key={aduana.aduana} value={aduana.aduana}>
                          {aduana.aduana}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Almacén</label>
                    <select
                      value={editCarguero.almacen}
                      onChange={(event) => setEditCarguero({ ...editCarguero, almacen: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Selecciona un almacén</option>
                      {catalogoAlmacenes.map((almacen) => (
                        <option key={almacen.almacen} value={almacen.almacen}>
                          {almacen.almacen}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !editCarguero.carguero_id || !editCarguero.eta || !editCarguero.llegada_real || !editCarguero.ultima_charola || !editCarguero.aduana || !editCarguero.almacen}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Información carguero</h2>
                {selectedCarguero ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenEditCarguero}
                      disabled={saving}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Guardando...' : 'Editar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCarguero}
                      disabled={saving}
                      className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                ) : null}
              </div>
              {selectedCarguero ? (
                <>
                  <div className="mt-4 space-y-4 text-sm text-slate-700">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ID de registro</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{selectedCarguero.id}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Carguero</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{selectedCarguero.carguero}</p>
                      </div>
                    </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ETA</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{new Date(selectedCarguero.eta).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Llegada Real</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{new Date(selectedCarguero.llegada_real).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Última Charola</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{new Date(selectedCarguero.ultima_charola).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Retraso</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {formatDateDifference(selectedCarguero.eta, selectedCarguero.llegada_real)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Aduana</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{selectedCarguero.aduana ?? '-'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Almacén</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{selectedCarguero.almacen ?? '-'}</p>
                    </div>
                    
                  </div>

                  <p className="mt-2 text-sm text-slate-600">Selecciona las incidencias del catálogo que apliquen para este carguero.</p>
                </div>

                {editingIncidencias ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Catálogo de incidencias</label>
                                <select
                                multiple
                                value={selectedIncidencias.map(String)}
                                onChange={handleIncidenciasChange}
                                className="min-h-[180px] w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                >
                                {catalogoIncidencias.map((incidencia) => (
                                    <option key={incidencia.id} value={incidencia.id}>
                                    {incidencia.codigo} - {incidencia.incidencia}
                                    </option>
                                ))}
                                </select>

                                <div className="mt-3 flex gap-3">
                                    <button type="button" onClick={handleSaveIncidencias} className="rounded-2xl bg-sky-600 px-4 py-2 text-white">Guardar</button>
                                    <button type="button" onClick={handleCloseIncidencias} className="rounded-2xl border border-slate-300 px-4 py-2">Cerrar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-slate-900">Incidencias asignadas</p>
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={handleToggleEditIncidencias} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">✏️</button>
                                  </div>
                                </div>
                                {selectedIncidencias.length ? (
                                <ul className="mt-3 space-y-2">
                                    {selectedIncidencias.map((incidenciaId) => {
                                    const item = catalogoIncidencias.find((inc) => inc.id === incidenciaId);
                                    return item ? (
                                        <li key={incidenciaId} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                                        <p className="font-medium text-slate-900">{item.codigo}</p>
                                        <p className="text-slate-600">{item.incidencia}</p>
                                        </li>
                                    ) : null;
                                    })}
                                </ul>
                                ) : (
                                <p className="mt-3 text-slate-500">No hay incidencias asignadas.</p>
                                )}
                            </div>
                        )}
                    
                    <div className="my-6 h-px bg-slate-200" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">DODAS</p>
                            <button
                                type="button"
                                onClick={handleToggleDodaSearch}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                                aria-label={showDodaSearch ? 'Ocultar búsqueda de DODAS' : 'Mostrar búsqueda de DODAS'}
                            >
                                +
                            </button>
                        </div>

                        {showDodaSearch ? (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">Buscar DODAS por fecha</p>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Desde
                                        <input
                                        type="date"
                                        value={dodaSearchDesde}
                                        onChange={(event) => setDodaSearchDesde(event.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        />
                                    </label>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Hasta
                                        <input
                                        type="date"
                                        value={dodaSearchHasta}
                                        onChange={(event) => setDodaSearchHasta(event.target.value)}
                                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        />
                                    </label>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSearchDodas}
                                        className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                                    >
                                        Buscar
                                    </button>
                                </div>

                                {dodasDisponibles.length > 0 ? (
                                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">DODAS disponibles encontrados {dodasDisponibles.length} ({selectedDodasFromSearch.length} seleccionadas)</p>
                                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                          {dodasDisponibles.map((doda) => (
                                            <label key={doda.doda} className="flex flex-col gap-1 rounded-2xl bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100">
                                              <div className="flex items-center gap-3">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedDodasFromSearch.includes(doda.doda)}
                                                  onChange={() => handleToggleDodaSelection(doda.doda)}
                                                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                                />
                                                <p className="font-medium text-slate-900">{doda.doda}</p>
                                                {doda.pedimentos && doda.pedimentos.length > 0 ? (
                                                  <span
                                                    className="ml-2 text-xs text-slate-500"
                                                    title={doda.pedimentos.join('\n')}
                                                    aria-label="Información de pedimentos"
                                                  >
                                                    ℹ️
                                                  </span>
                                                ) : null}
                                              </div>
                                              <div className="ml-7 text-xs text-slate-700">
                                                <div>CAAT: {doda.caat}</div>
                                                <div>Transportista: {doda.nombreTransportista}</div>
                                                <div>Fecha cruce: {doda.fecha_cruce}</div>
                                              </div>
                                            </label>
                                          ))}
                                        </div>

                                        {selectedDodasFromSearch.length > 0 ? (
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleOpenDestinoModal}
                                                    disabled={saving}
                                                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 disabled:bg-slate-300"
                                                >
                                                    {saving ? 'Guardando...' : 'Guardar DODAs'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDodasFromSearch([])}
                                                    className="rounded-2xl border border-slate-300 px-4 py-2 hover:bg-slate-100"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            <p className="text-sm font-semibold text-slate-900">Transportes registrados</p>
                            {transportesCarguero.length ? (
                              <ul className="mt-3 space-y-2">
                                {transportesCarguero.map((transporte) => (
                                  <li key={transporte.doda} className="flex flex-col gap-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-900">{transporte.doda}</p>
                                        {transporte.pedimentos && transporte.pedimentos.length > 0 ? (
                                          <span
                                            className="text-xs text-slate-500"
                                            title={transporte.pedimentos.join('\n')}
                                            aria-label="Información de pedimentos"
                                          >
                                            ℹ️
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEditTransporteIncidencias(transporte.transporte_id)}
                                          className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                                        >
                                          Incidencias
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTransporteCarguero(transporte.doda)}
                                          className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>
                                    <div className="ml-7 text-xs text-slate-700">
                                      <div>CAAT: {transporte.caat}</div>
                                      <div>Transportista: {transporte.nombreTransportista}</div>
                                      <div>Fecha cruce: {transporte.fecha_cruce}</div>
                                      <div>Destino: {transporte.destino || 'Sin destino'}</div>
                                      <div>SLA: {transporte.hora_limite || 'Sin hora limite'}</div>
                                    </div>
                                    {editingTransporteId === transporte.transporte_id && (
                                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <label className="block text-sm font-medium text-slate-700">Incidencias de transporte</label>
                                        <select
                                          multiple
                                          value={selectedIncidenciasTransporte.map(String)}
                                          onChange={handleIncidenciasTransporteChange}
                                          className="min-h-[120px] w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        >
                                          {catalogoIncidenciasTransporte.map((inc) => (
                                            
                                            <option key={inc.id} value={inc.id}>
                                              {inc.codigo} - {inc.incidencia}
                                            </option>
                                            
                                          ))}
                                        </select>
                                        <div className="mt-3 flex gap-3">
                                          <button type="button" onClick={handleSaveTransporteIncidencias} className="rounded-2xl bg-sky-600 px-4 py-2 text-white">Guardar</button>
                                          <button type="button" onClick={handleCloseTransporteIncidencias} className="rounded-2xl border border-slate-300 px-4 py-2">Cerrar</button>
                                        </div>
                                      </div>
                                    )}
                                    {transporte.incidencias?.length ? (
                                      <div className="mt-2 ml-7 text-xs text-slate-700">
                                        <span className="font-semibold">Incidencias asignadas:</span>
                                        <ul className="list-disc ml-4">
                                          {transporte.incidencias.map((incidencia) => {
                                            return (
                                              <li key={incidencia.id}>{incidencia.codigo} - {incidencia.incidencia}</li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-3 text-slate-500">No hay transportes dadas de alta.</p>
                            )}
                        </div>
                    </div>
                </>
              ) : (
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <p>Selecciona un carguero en la lista para ver sus datos en este panel.</p>
                    <div className="mt-5 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <p>- Total de cargueros mostrados: {cargueros.length}</p>
                        <p>- Haz clic en una fila para ver la información del carguero.</p>
                        <p>- La lista se actualiza cuando se registra un nuevo carguero.</p>
                    </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        {showExportModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Descargar cargueros</h2>
                  <p className="mt-2 text-sm text-slate-600">Selecciona un rango de fechas para extraer la información en formato Excel.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseExportModal}
                  className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Cerrar modal de descarga"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Desde
                  <input
                    type="date"
                    value={exportDesde}
                    onChange={(event) => setExportDesde(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Hasta
                  <input
                    type="date"
                    value={exportHasta}
                    onChange={(event) => setExportHasta(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
              </div>

              {exportError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {exportError}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseExportModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExportCarguerosExcel}
                  disabled={exporting}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {exporting ? 'Generando...' : 'Descargar Excel'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {showDestinoModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 overflow-auto">
            <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Asignar destinos</h2>
                  <p className="mt-2 text-sm text-slate-600">Selecciona un destino para cada DODA antes de guardarlas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDestinoModal(false)}
                  className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Cerrar modal de destinos"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {selectedDodasFromSearch.map((doda) => (
                  <div key={doda} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">DODA: {doda}</p>
                    <label className="mt-3 block text-sm font-medium text-slate-700">
                      Destino
                      <select
                        value={selectedDodaDestinos[doda] ?? ''}
                        onChange={(event) => handleDestinoChange(doda, event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      >
                        <option value="">Selecciona un destino</option>
                        {catalogoDestinos.map((destino) => (
                          <option key={destino.destino} value={destino.destino}>{destino.destino}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}

                {destinoError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {destinoError}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowDestinoModal(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCargueroDodasFromSearch}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? 'Guardando...' : 'Guardar DODAs'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
