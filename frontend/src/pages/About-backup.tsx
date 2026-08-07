
import {
  Clock3,
  Rocket,
  Film,
  MonitorPlay,
  Trophy,
  Utensils,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      {/* Navbar */}
      <header className="border-b border-red-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-6">
          <h1 className="text-2xl font-black text-red-500">CINESTAR</h1>

          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <Link to="/">Movies</Link>
            <Link to="/theaters">Theaters</Link>
            <Link to="/offers">Offers</Link>
            <Link
              to="/about"
              className="text-red-500 font-semibold border-b border-red-500"
            >
              About Us
            </Link>
          </nav>

          <img
            src="https://i.pravatar.cc/40"
            className="rounded-full w-10 h-10"
            alt=""
          />
        </div>
      </header>

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

      {/* Footer */}
      <footer className="border-t border-red-900/30 mt-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 px-6 py-14">
          <div>
            <h2 className="text-xl font-black text-red-500">CINESTAR</h2>

            <p className="text-gray-400 mt-4">
              Elevating the cinematic experience through innovation and digital
              entertainment.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>

            <ul className="space-y-3 text-gray-400">
              <li>Movies</li>
              <li>Theaters</li>
              <li>Offers</li>
              <li>About</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Support</h3>

            <ul className="space-y-3 text-gray-400">
              <li>Contact</li>
              <li>FAQ</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Social</h3>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-600"></div>
              <div className="w-10 h-10 rounded-full bg-red-600"></div>
              <div className="w-10 h-10 rounded-full bg-red-600"></div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm pb-6">
          © 2026 CineStar Studios. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}