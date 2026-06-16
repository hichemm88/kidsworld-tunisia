"use client";

import Link from "next/link";

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-red-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
          ❌
        </div>
        <h1 className="font-bebas text-[32px] text-[#111827] tracking-wide mb-2">Paiement annulé</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
          Votre paiement n&apos;a pas abouti ou a été annulé. Vous n&apos;avez pas été débité.
        </p>
        <div className="bg-[#F7F6F2] rounded-xl p-4 mb-6 text-left">
          <p className="text-[13px] font-bold text-gray-600 mb-1">Raisons possibles :</p>
          <ul className="text-[12px] text-gray-400 space-y-1">
            <li>• Carte refusée ou solde insuffisant</li>
            <li>• Transaction annulée manuellement</li>
            <li>• Délai de session expiré</li>
            <li>• Problème de connexion</li>
          </ul>
        </div>
        <div className="space-y-3">
          <Link
            href="/tarifs"
            className="block w-full bg-[#F26522] text-white font-extrabold text-[14px] py-4 rounded-xl hover:bg-[#FF8C4B] transition-colors"
          >
            Réessayer le paiement
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-black/10 text-gray-600 font-bold text-[14px] py-3.5 rounded-xl hover:border-[#0D2461]/20 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <a href="mailto:support@kidsworld.tn" className="block text-[12px] text-gray-400 hover:text-gray-600 mt-2">
            Un problème ? support@kidsworld.tn
          </a>
        </div>
      </div>
    </div>
  );
}
