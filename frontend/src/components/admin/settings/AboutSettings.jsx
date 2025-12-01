import React, { useState } from 'react';
import Button from '../../ui/Button';

const AboutSettings = ({ initialData, onSave, saving }) => {
  const init = initialData || {};
  const [aboutUs, setAboutUs] = useState({
    heroTitle: init.heroTitle || '',
    heroSubtitle: init.heroSubtitle || '',
    whoWeAre: init.whoWeAre || '',
    mission: init.mission || '',
    vision: init.vision || '',
    stats: {
      happyTravelers: init.stats?.happyTravelers || '',
      tourPackages: init.stats?.tourPackages || '',
      destinations: init.stats?.destinations || '',
      yearsExperience: init.stats?.yearsExperience || ''
    }
  });

  // Initialize editable core values (array of { title, description, icon })
  const [values, setValues] = useState(() => {
    const src = init.values || [
      { title: 'Passion for Travel', description: 'We are travelers at heart — passionate about sharing Bukidnon’s natural beauty and culture with curious explorers.', icon: 'Heart' },
      { title: 'Safety First', description: 'Your safety is our priority. We partner with certified guides and follow best practices so you can travel with confidence.', icon: 'ShieldCheck' },
      { title: 'Sustainable Tourism', description: 'We practice responsible tourism that respects local cultures and protects the natural environment for future generations.', icon: 'Globe' },
      { title: 'Community Focused', description: 'We create local impact by hiring community guides and partnering with small businesses and artisans.', icon: 'Users' }
    ];
    return src.map((v) => ({ title: v.title || '', description: v.description || '', icon: v.icon || '' }));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ aboutUs: { ...aboutUs, values } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">About Page Content</h3>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Title</label>
            <input
              type="text"
              value={aboutUs.heroTitle}
              onChange={(e) => setAboutUs({ ...aboutUs, heroTitle: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Core Values (Why Choose Us)</h4>
            <div className="space-y-4">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white p-4 rounded-md border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => setValues(values.map((v, i) => i === idx ? { ...v, title: e.target.value } : v))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      />

                      <label className="block text-sm font-medium text-gray-700 mt-3">Description</label>
                      <textarea
                        rows={2}
                        value={val.description}
                        onChange={(e) => setValues(values.map((v, i) => i === idx ? { ...v, description: e.target.value } : v))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Icon Key</label>
                      <input
                        type="text"
                        value={val.icon}
                        onChange={(e) => setValues(values.map((v, i) => i === idx ? { ...v, icon: e.target.value } : v))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      />
                      <p className="text-xs text-gray-500 mt-2">Optional. Use icon keys like <code>Heart</code>, <code>ShieldCheck</code>, <code>Globe</code>, <code>Users</code>.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
            <input
              type="text"
              value={aboutUs.heroSubtitle}
              onChange={(e) => setAboutUs({ ...aboutUs, heroSubtitle: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Who We Are</label>
            <textarea
              rows={3}
              value={aboutUs.whoWeAre}
              onChange={(e) => setAboutUs({ ...aboutUs, whoWeAre: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mission</label>
            <textarea
              rows={3}
              value={aboutUs.mission}
              onChange={(e) => setAboutUs({ ...aboutUs, mission: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vision</label>
            <textarea
              rows={3}
              value={aboutUs.vision}
              onChange={(e) => setAboutUs({ ...aboutUs, vision: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Happy Travelers</label>
              <input
                type="text"
                value={aboutUs.stats.happyTravelers}
                onChange={(e) => setAboutUs({ ...aboutUs, stats: { ...aboutUs.stats, happyTravelers: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tour Packages</label>
              <input
                type="text"
                value={aboutUs.stats.tourPackages}
                onChange={(e) => setAboutUs({ ...aboutUs, stats: { ...aboutUs.stats, tourPackages: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Destinations</label>
              <input
                type="text"
                value={aboutUs.stats.destinations}
                onChange={(e) => setAboutUs({ ...aboutUs, stats: { ...aboutUs.stats, destinations: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years Experience</label>
              <input
                type="text"
                value={aboutUs.stats.yearsExperience}
                onChange={(e) => setAboutUs({ ...aboutUs, stats: { ...aboutUs.stats, yearsExperience: e.target.value } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" variant="primary" isLoading={saving}>
          Save About Page
        </Button>
      </div>
    </form>
  );
};

export default AboutSettings;
