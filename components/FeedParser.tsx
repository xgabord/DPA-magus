import React, { useState } from 'react';
import { Button } from './Button';

interface FeedParserProps {
  onDataParsed: (data: string) => void;
}

export const FeedParser: React.FC<FeedParserProps> = ({ onDataParsed }) => {
  const [xmlInput, setXmlInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const parseFeed = () => {
    if (!xmlInput.trim()) return;

    try {
      const parser = new DOMParser();
      // Wrap in a root element to ensure valid XML parsing if just <item> is pasted
      const xmlString = `<root>${xmlInput}</root>`;
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      const getTagVal = (tag: string) => {
        // Try with namespace and without
        const nsEl = xmlDoc.getElementsByTagName(tag)[0];
        if (nsEl) return nsEl.textContent;
        const el = xmlDoc.getElementsByTagName(tag.replace('g:', ''))[0];
        return el ? el.textContent : '';
      };

      const title = getTagVal('g:title');
      const desc = getTagVal('g:description');
      const price = getTagVal('g:price');
      const salePrice = getTagVal('g:sale_price');
      
      // Extract generic text content to help context
      let context = '';
      if (title) context += `Product Name: ${title}. `;
      if (price) context += `Price point: ${price}. `;
      if (salePrice) context += `On Sale: ${salePrice}. `;
      if (desc) {
        // Truncate description if too long to save tokens
        const cleanDesc = desc.substring(0, 300).replace(/<[^>]*>?/gm, '');
        context += `Context/Description: ${cleanDesc}...`;
      }

      onDataParsed(context);
      setXmlInput(''); // Clear input on success
      setIsExpanded(false); // Collapse
    } catch (e) {
      console.error("XML Parse error", e);
      alert("Nem sikerült feldolgozni az XML-t. Ellenőrizd a formátumot.");
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden mb-8 transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
      >
        <span className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Termékadatok bemásolása (XML Feed)
        </span>
        <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="text-sm text-slate-400">
            Másold be ide a termék XML &lt;item&gt; részét a cím, ár és leírás kinyeréséhez.
          </div>
          <textarea
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="<item>
  <g:title>Példa Termék</g:title>
  ...
</item>"
          />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={parseFeed} className="text-sm py-2">
              Adatok alkalmazása
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};