import AboutContent from '../models/AboutContent.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryHelpers.js';

// @desc    Get about page content
// @route   GET /api/about
// @access  Public
export const getAboutContent = async (req, res) => {
  try {
    let content = await AboutContent.findOne();
    if (!content) {
      content = await AboutContent.create({
        heroTitle: 'Our Story',
        heroSubtitle: 'Driven by passion, defined by excellence. Discover how Avni’s Cars Collections became the trusted name in premium pre-owned vehicles.',
        establishedYear: '2012',
        legacyText: 'Over a decade ago, Avni’s Cars Collections opened its doors with a singular vision: to redefine the pre-owned luxury car market by stripping away the typical dealership friction and replacing it with pure enthusiasm and trust. Today, we stand as the region\'s most respected destination for automotive excellence.',
        vehiclesSold: '5,000+',
        yearsExperience: '12+',
        trustedFeatures: [
          { title: "Certified Vehicles", description: "Every car passes a 200-point rigorous inspection before entering our showroom." },
          { title: "Transparent Pricing", description: "No hidden fees or surprise costs. We believe in upfront, honest market pricing." },
          { title: "White-Glove Service", description: "From custom financing to doorstep delivery, we handle the logistics for you." },
          { title: "Nationwide Warranty", description: "Drive with peace of mind knowing our premium vehicles are fully backed." }
        ],
        visionText: 'To be the undisputed leader in the premium automotive sector, recognized globally for uncompromising quality, radical transparency, and an unparalleled customer experience that makes buying a car as thrilling as driving one.',
        missionText: 'To meticulously curate the finest selection of premium vehicles, back them with rigorous certified inspections, and foster a community built on trust, respect, and automotive passion for every client who walks through our doors.',
        directorName: 'Mr. Rishu Hinduja',
        directorRole: 'Owner',
        directorMessage: '"When I started Avni’s Cars Collections in 1992, my goal wasn\'t just to sell cars. I wanted to build a sanctuary for automotive enthusiasts. An environment where the anxiety of buying a pre-owned vehicle is completely eliminated by absolute transparency."\n\n"Every vehicle on our lot is a testament to our standards. I personally ensure that we reject more cars than we accept. We don\'t just hand you the keys; we hand you a promise of quality, reliability, and unparalleled white-glove service. Thank you for trusting us with your journey."',
        directorImage: '',
        popularBrands: ["Mercedes-Benz", "BMW", "Audi", "Porsche", "Lexus", "Land Rover", "Jaguar", "Volvo"],
        financePartners: ["HDFC Bank"]
      });
    } else {
      const sanitize = (val) => {
        if (typeof val !== 'string') return val;
        return val
          .replace(/A\s*One\s*Car\s*Baza?a?r/gi, "Avni’s Cars Collections")
          .replace(/AOneCarBazaar/gi, "Avni’s Cars Collections")
          .replace(/AOneCarBazar/gi, "Avni’s Cars Collections")
          .replace(/AOne/gi, "Avni")
          .replace(/Anand\s*Verma/gi, "Mr. Rishu Hinduja");
      };
      
      const updatedFields = {
        heroTitle: sanitize(content.heroTitle),
        heroSubtitle: sanitize(content.heroSubtitle),
        legacyText: sanitize(content.legacyText),
        visionText: sanitize(content.visionText),
        missionText: sanitize(content.missionText),
        directorName: "Mr. Rishu Hinduja",
        directorRole: "Owner"
      };

      if (content.directorMessage) {
        updatedFields.directorMessage = sanitize(content.directorMessage).replace(/2012/g, '1992');
      }
      if (content.trustedFeatures) {
        updatedFields.trustedFeatures = content.trustedFeatures.map(f => ({
          title: sanitize(f.title),
          description: sanitize(f.description)
        }));
      }
      if (!content.financePartners || content.financePartners.length === 0) {
        updatedFields.financePartners = ["HDFC Bank"];
      }

      await content.update(updatedFields);
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update about page content
// @route   PUT /api/about
// @access  Private/Admin
export const updateAboutContent = async (req, res) => {
  try {
    const data = { ...req.body };

    if (typeof data.trustedFeatures === 'string') {
      data.trustedFeatures = JSON.parse(data.trustedFeatures);
    }
    if (typeof data.popularBrands === 'string') {
      data.popularBrands = JSON.parse(data.popularBrands);
    }
    if (typeof data.financePartners === 'string') {
      data.financePartners = JSON.parse(data.financePartners);
    }

    // Handle director image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'car-dealer/about');
      data.directorImage = result.secure_url;
    }

    let content = await AboutContent.findOne();
    if (content) {
      if (req.file && content.directorImage) {
        const oldId = getPublicIdFromUrl(content.directorImage);
        if (oldId) await deleteFromCloudinary(oldId);
      }
      await content.update(data);
    } else {
      content = await AboutContent.create(data);
    }

    res.json(content);
  } catch (error) {
    console.error('updateAboutContent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
