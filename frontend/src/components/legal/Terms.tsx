// @/components/legal/Terms.tsx

"use client";
import React from "react";
import { translations } from "@/translations";
import { Card, CardContent } from "@/components/ui/card";
import AuthHeader from "@/components/common/Header";
import { useLanguage } from "@/components/context/LanguageContext";

export function TermsOfService() {
  const { language } = useLanguage();
  const t = translations.legal[language].terms;

  return (
    <>
      <AuthHeader />
      <div className="max-w-4xl mx-auto mt-12 p-4">
        <Card className="p-6">
          <CardContent>
            <div className="max-w-4xl mx-auto mt-12 p-4">
              <h1 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200 mb-4">
                {t.termsAndCondition}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                {t.effectiveDate}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                {t.welcome}
              </p>

              {/* Definitions */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.definitions.title}
                </h2>
                <ul className="space-y-4">
                  <li className="text-neutral-600 dark:text-neutral-400">
                    {t.definitions.client}
                  </li>
                  <li className="text-neutral-600 dark:text-neutral-400">
                    {t.definitions.confidentialInfo}
                  </li>
                  <li className="text-neutral-600 dark:text-neutral-400">
                    {t.definitions.services}
                  </li>
                  <li className="text-neutral-600 dark:text-neutral-400">
                    {t.definitions.forceMajeure}
                  </li>
                </ul>
              </section>

              {/* Scope */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.scope.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t.scope.content}
                </p>
              </section>

              {/* User Obligations */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.userObligations.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.userObligations.intro}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  {t.userObligations.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.intellectualProperty.title}
                </h2>
                <div className="space-y-4">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.intellectualProperty.ownership}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.intellectualProperty.licensing}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.intellectualProperty.restrictions}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.intellectualProperty.violation}
                  </p>
                </div>
              </section>

              {/* Payment Terms */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.paymentTerms.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {t.paymentTerms.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.limitationOfLiability.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {t.limitationOfLiability.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Warranties */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.warranties.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.warranties.intro}
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  {t.warranties.warrants.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="font-medium text-lg mb-2 text-neutral-800 dark:text-neutral-200">
                  {t.warranties.exclusions.title}
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  {t.warranties.exclusions.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.termination.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.termination.forCause}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.termination.forConvenience}
                </p>
                <div className="mb-4">
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                    {t.termination.uponTermination.intro}
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    {t.termination.uponTermination.list.map((item, index) => (
                      <li
                        key={index}
                        className="text-neutral-600 dark:text-neutral-400"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t.termination.fees}
                </p>
              </section>

              {/* Compliance with Laws */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.complianceWithLaws.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.complianceWithLaws.adherence.intro}
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  {t.complianceWithLaws.adherence.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t.complianceWithLaws.clientCompliance}
                </p>
              </section>

              {/* Data Protection */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.dataProtection.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {t.dataProtection.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.disputeResolution.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {t.disputeResolution.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.governingLaw.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t.governingLaw.content}
                </p>
              </section>

              {/* Modifications */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.modifications.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {t.modifications.list.map((item, index) => (
                    <li
                      key={index}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Contact Section */}
              <section className="mb-8">
                <h2 className="font-semibold text-xl mb-4 text-neutral-800 dark:text-neutral-200">
                  {t.contact.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t.contact.intro}
                </p>
                <div className="space-y-2">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.contact.email}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.contact.phone}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t.contact.address}
                  </p>
                </div>
              </section>

              {/* Footer */}
              <footer className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  {t.footer}
                </p>
                <p className="text-neutral-400 dark:text-neutral-600 text-center mt-2">
                  Version: {t.version}
                </p>
              </footer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
