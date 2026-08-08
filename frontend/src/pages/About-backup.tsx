
import {
  Clock3,
  Rocket,
  Film,
  MonitorPlay,
  Trophy,
  Utensils,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0f] text-white">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="uppercase tracking-[4px] text-red-500 text-xs font-bold">
          Give The Magic Of Cinema
        </p>

        <div className="grid lg:grid-cols-2 gap-12 mt-5">
          {/* Left */}
          <div>
            <h1 className="text-6xl font-black leading-none">
              OUR CINEMATIC
              <br />
              <span className="text-red-500">LEGACY</span>
            </h1>

            <div className="mt-14 space-y-10">
              <div className="flex gap-5">
                <Clock3 className="text-red-500 mt-1" />

                <div>
                  <h3 className="text-2xl font-bold mb-2">Our History</h3>

                  <p className="text-gray-400 leading-8">
                    Founded in 2012, CineStar began with a single vision:
                    redefine the cinematic experience. What started as a boutique
                    theater has grown into a premium entertainment destination.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <Rocket className="text-red-500 mt-1" />

                <div>
                  <h3 className="text-2xl font-bold mb-2">Our Mission</h3>

                  <p className="text-gray-400 leading-8">
                    We strive to deliver world-class cinema by combining
                    cutting-edge technology with exceptional customer service.
                    Every visit should become an unforgettable experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <p className="text-gray-300 leading-8">
              Since 2012, CineStar has been at the forefront of cinematic
              innovation, blending luxury comfort with cutting-edge technology
              to create unforgettable moments for movie enthusiasts.
            </p>

            <div className="bg-[#17181d] border border-gray-700 rounded-2xl p-8 mt-12">
              <h2 className="text-2xl font-bold mb-8">
                The CineStar Standard
              </h2>

              <div className="space-y-7">
                <div className="flex gap-4">
                  <Film className="text-red-500" />

                  <div>
                    <h4 className="font-semibold">IMAX® Experience</h4>
                    <p className="text-sm text-gray-400">
                      Unparalleled brightness and clarity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MonitorPlay className="text-red-500" />

                  <div>
                    <h4 className="font-semibold">4DX® Technology</h4>
                    <p className="text-sm text-gray-400">
                      Motion seats & environmental effects.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Utensils className="text-red-500" />

                  <div>
                    <h4 className="font-semibold">Gold Class Luxury</h4>
                    <p className="text-sm text-gray-400">
                      Premium reclining seats with dining service.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Trophy className="text-red-500" />

                  <div>
                    <h4 className="font-semibold">Award Winning</h4>
                    <p className="text-sm text-gray-400">
                      Cambodia's premium cinema experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </>
  );
}