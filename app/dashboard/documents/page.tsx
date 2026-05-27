'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

type DocumentType = 'issued_invoice' | 'received_invoice' | 'receipt' | 'bank_statement' | 'other';

interface Document {
  id: string;
  client_id: string | null;
  user_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  amount: number | null;
  date: string | null;
  vendor_name: string | null;
  notes: string | null;
  ai_extracted: boolean;
  created_at: string;
}

export default function DocumentsPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('issued_invoice');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');

  const appVersion = getAppVersion();
  const t = appVersion === 'v2' ? sl.documents : {
    title: 'Documents',
    upload: 'Upload Document',
    type: {
      issued_invoice: 'Issued Invoice',
      received_invoice: 'Received Invoice',
      receipt: 'Receipt',
      bank_statement: 'Bank Statement',
      other: 'Other',
    },
    uploadNew: 'Upload New Document',
    processing: 'Processing document...',
    extracting: 'Extracting data...',
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
      // Only show error toast for actual errors, not for table not existing
      if (error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
        showToast('Napaka pri nalaganju dokumentov', 'error');
      }
    }

    setDocuments(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast('Niste prijavljeni', 'error');
      setUploading(false);
      return;
    }

    try {
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents-v2')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents-v2')
        .getPublicUrl(fileName);

      // Create document record
      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type: selectedType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          ai_extracted: false,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      showToast('Dokument uspešno naložen!', 'success');
      loadDocuments();

      // TODO: Trigger AI extraction in background
      // triggerAIExtraction(doc.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Napaka pri nalaganju dokumenta', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(doc => doc.document_type === filterType);

  if (loading) {
    return <div className="text-center py-12">Nalaganje...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">Upravljajte z izdanimi in prejetimi računi</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.uploadNew}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vrsta dokumenta
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType)}
              className="input w-full"
              disabled={uploading}
            >
              <option value="issued_invoice">{t.type.issued_invoice}</option>
              <option value="received_invoice">{t.type.received_invoice}</option>
              <option value="receipt">{t.type.receipt}</option>
              <option value="bank_statement">{t.type.bank_statement}</option>
              <option value="other">{t.type.other}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datoteka
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="input w-full"
              disabled={uploading}
            />
          </div>
        </div>
        {uploading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="text-blue-800">{t.processing}</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtriraj po vrsti
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
          className="input w-full md:w-auto md:min-w-[250px]"
        >
          <option value="all">Vsi dokumenti</option>
          <option value="issued_invoice">{t.type.issued_invoice}</option>
          <option value="received_invoice">{t.type.received_invoice}</option>
          <option value="receipt">{t.type.receipt}</option>
          <option value="bank_statement">{t.type.bank_statement}</option>
          <option value="other">{t.type.other}</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dokumenti ({filteredDocuments.length})
        </h2>
        {filteredDocuments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Ni dokumentov. Naložite prvega zgoraj.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {doc.document_type === 'issued_invoice' && (
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {doc.document_type === 'received_invoice' && (
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {doc.document_type === 'receipt' && (
                      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                    )}
                    {doc.document_type === 'bank_statement' && (
                      <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {doc.document_type === 'other' && (
                      <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.file_name}</h4>
                    <p className="text-sm text-gray-600">
                      {t.type[doc.document_type]}
                      {doc.amount && ` • ${doc.amount.toFixed(2)} €`}
                      {doc.vendor_name && ` • ${doc.vendor_name}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(doc.created_at).toLocaleDateString('sl-SI')}
                      {doc.ai_extracted && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                          AI izvlečeno
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Odpri"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
