import '@/css/Home.css';
import PastePanel from '@/components/Pastes/PastePanel';
import { useConfig } from '@/hooks/useConfig';
import LoadingIcon from '@/components/LoadingIcon';
import { useDataContext } from '@/hooks/useDataContext';
import { useState, useMemo } from 'react';
import { DataProvider } from '@/context/DataContext';
import NotificationModal from '@/components/NotificationModal';
import { useSearch } from "@/context/SearchContext";
import { useLocation, useParams } from 'react-router-dom';

const Home = ({ mode, onConnectChange }) => {
  const { pasteKey, rtKey } = useParams();
  const { config, configLoading } = useConfig();
  const location = useLocation();
  const isStaticMode = mode === 'static';

  const currentKey = isStaticMode ? pasteKey : rtKey;

  const requestConfig = useMemo(() => {
    if (!config?.apiConfig?.baseUrl) return null;

    const baseApi = `${config.apiConfig.baseUrl}${config.apiConfig.endpoints.pastes.all}`;

    return {
      baseUrl: baseApi,
      params: {}
    };
  }, [config]);

  if (configLoading) return <p className="text-center mt-5"><LoadingIcon /></p>;

  return (
    <DataProvider key={location.key} config={requestConfig}>
      <HomeContent requestConfig={requestConfig} mode={mode} pasteKey={currentKey} onConnectChange={onConnectChange} />
    </DataProvider>
  );
};

const HomeContent = ({ requestConfig, mode, pasteKey, onConnectChange }) => {
  const { data, dataLoading, postData } = useDataContext();
  const [createdKey, setCreatedKey] = useState(null);
  const { searchTerm } = useSearch();
  const isStaticMode = mode === 'static';

  const filteredPublicPastes = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const normalizedSearchTerm = (searchTerm ?? "").toLowerCase();
    return data.filter((paste) => (paste.title ?? "").toLowerCase().includes(normalizedSearchTerm));
  }, [data, searchTerm]);

  if (isStaticMode && dataLoading) return <p className="text-center mt-5"><LoadingIcon /></p>;

  const handleSubmit = async (paste, isAutosave = false) => {
    try {
      const createdPaste = await postData(requestConfig.baseUrl, paste);
      if (!isAutosave && createdPaste && !paste.pasteKey) {
        setCreatedKey(createdPaste.pasteKey);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <PastePanel
        onSubmit={handleSubmit}
        publicPastes={filteredPublicPastes}
        mode={mode}
        pasteKey={pasteKey}
        onConnectChange={onConnectChange}
      />

      <NotificationModal
        show={createdKey !== null}
        onClose={() => setCreatedKey(null)}
        title="¡Bomba! Paste creado"
        message={
          <span>
            Tu paste se ha guardado correctamente. Puedes compartirlo con este enlace:
            <br /><br />
            <a
              href={`https://paste.miarma.net/s/${createdKey}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary font-weight-bold"
            >
              https://paste.miarma.net/s/{createdKey}
            </a>
            <br /><br />
            {mode === 'rt' && "Nota: Al guardarlo, se ha creado una copia estática permanente."}
          </span>
        }
        variant="success"
        buttons={[
          { label: "Cerrar", variant: "secondary", onClick: () => setCreatedKey(null) }
        ]}
      />
    </>
  );
}

export default Home;
