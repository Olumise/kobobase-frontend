'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Search } from 'lucide-react';
import { Contact, ContactType } from '@/lib/types/contact';
import { Category } from '@/lib/types/category';
import { contactsApi, categoriesApi } from '@/lib/api';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactFormModal } from '@/components/contacts/ContactFormModal';
import { ContactDeleteDialog } from '@/components/contacts/ContactDeleteDialog';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactsSettingsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [contactsResponse, categoriesResponse] = await Promise.all([
        contactsApi.getAllContacts(500),
        categoriesApi.getAllCategories(),
      ]);
      const contactsData = contactsResponse.data?.data || contactsResponse.data || [];
      const categoriesData = categoriesResponse.data?.data?.categories || categoriesResponse.data?.categories || [];
      setContacts(contactsData);
      setCategories(categoriesData);
      setFilteredContacts(contactsData);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        (contact.ContactType && contact.ContactType.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(contact => contact.ContactType === typeFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, typeFilter]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setFormModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormModalOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Contacts</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchContacts}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Contacts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your transaction contacts and payees
          </p>
        </div>
        <button
          onClick={handleAddContact}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={16} className="mr-2" />
          Add Contact
        </button>
      </div>

      {error && contacts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value={ContactType.PERSON}>Person</SelectItem>
              <SelectItem value={ContactType.MERCHANT}>Merchant</SelectItem>
              <SelectItem value={ContactType.BANK}>Bank</SelectItem>
              <SelectItem value={ContactType.PLATFORM}>Platform</SelectItem>
              <SelectItem value={ContactType.WALLET}>Wallet</SelectItem>
              <SelectItem value={ContactType.SYSTEM}>System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No contacts yet</h3>
          <p className="text-muted-foreground mb-6">
            Add contacts to track transactions with people and businesses
          </p>
          <button
            onClick={handleAddContact}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Contact
          </button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {filteredContacts.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            ))}
          </div>
        </>
      )}

      <ContactFormModal
        contact={selectedContact}
        categories={categories}
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSave={fetchContacts}
      />

      <ContactDeleteDialog
        contact={selectedContact}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={fetchContacts}
      />
    </div>
  );
}
