// Digital Marketing Audit Tool
(function () {
    'use strict';

    // Step navigation
    document.querySelectorAll('.form-next').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var next = parseInt(this.dataset.next);
            goToStep(next);
        });
    });

    document.querySelectorAll('.form-back').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var back = parseInt(this.dataset.back);
            goToStep(back);
        });
    });

    function goToStep(step) {
        document.querySelectorAll('.form-step').forEach(function (s) {
            s.classList.remove('active');
        });
        var target = document.querySelector('[data-step="' + step + '"]');
        if (target) target.classList.add('active');
        var bar = document.getElementById('progressBar');
        if (bar) bar.style.width = (step * 25) + '%';
    }

    // Form submission
    var form = document.getElementById('auditForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            runAudit();
        });
    }

    // Rerun button
    var rerun = document.getElementById('rerunAudit');
    if (rerun) {
        rerun.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('audit-results').style.display = 'none';
            document.querySelector('.audit-form-section').style.display = '';
            document.querySelector('.audit-hero').style.display = '';
            goToStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function runAudit() {
        var websiteUrl = document.getElementById('website').value.trim();
        var instagram = document.getElementById('instagram').value.trim();
        var facebook = document.getElementById('facebook').value.trim();
        var tiktok = document.getElementById('tiktok').value.trim();
        var googleBiz = document.getElementById('google-business').value;
        var businessType = document.getElementById('business-type').value;
        var challenge = document.getElementById('biggest-challenge').value;
        var currentMarketing = document.getElementById('current-marketing').value;
        var userName = document.getElementById('name').value.trim();
        var userEmail = document.getElementById('email').value.trim();

        // Hide form, show loading
        document.querySelector('.audit-form-section').style.display = 'none';
        document.querySelector('.audit-hero').style.display = 'none';
        var loadingEl = document.getElementById('audit-loading');
        loadingEl.style.display = '';

        // Ensure URL has protocol
        if (websiteUrl && !websiteUrl.match(/^https?:\/\//)) {
            websiteUrl = 'https://' + websiteUrl;
        }

        var statusEl = document.getElementById('loadingStatus');

        // Try PageSpeed Insights API
        if (websiteUrl) {
            statusEl.textContent = 'Running website performance test...';
            var apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' +
                encodeURIComponent(websiteUrl) +
                '&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile';

            fetch(apiUrl)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    statusEl.textContent = 'Analyzing results...';
                    setTimeout(function () {
                        var scores = extractScores(data);
                        showResults(scores, {
                            websiteUrl: websiteUrl,
                            instagram: instagram,
                            facebook: facebook,
                            tiktok: tiktok,
                            googleBiz: googleBiz,
                            businessType: businessType,
                            challenge: challenge,
                            currentMarketing: currentMarketing,
                            userName: userName,
                            audits: data.lighthouseResult ? data.lighthouseResult.audits : null
                        });
                    }, 800);
                })
                .catch(function () {
                    statusEl.textContent = 'Could not reach that URL. Generating report from your answers...';
                    setTimeout(function () {
                        showResults(null, {
                            websiteUrl: websiteUrl,
                            instagram: instagram,
                            facebook: facebook,
                            tiktok: tiktok,
                            googleBiz: googleBiz,
                            businessType: businessType,
                            challenge: challenge,
                            currentMarketing: currentMarketing,
                            userName: userName,
                            audits: null
                        });
                    }, 1500);
                });
        } else {
            setTimeout(function () {
                showResults(null, {
                    websiteUrl: '',
                    instagram: instagram,
                    facebook: facebook,
                    tiktok: tiktok,
                    googleBiz: googleBiz,
                    businessType: businessType,
                    challenge: challenge,
                    currentMarketing: currentMarketing,
                    userName: userName,
                    audits: null
                });
            }, 1000);
        }
    }

    function extractScores(data) {
        if (!data || !data.lighthouseResult || !data.lighthouseResult.categories) {
            return null;
        }
        var cats = data.lighthouseResult.categories;
        return {
            performance: Math.round((cats.performance ? cats.performance.score : 0) * 100),
            seo: Math.round((cats.seo ? cats.seo.score : 0) * 100),
            accessibility: Math.round((cats.accessibility ? cats.accessibility.score : 0) * 100),
            bestPractices: Math.round((cats['best-practices'] ? cats['best-practices'].score : 0) * 100)
        };
    }

    function scoreClass(score) {
        if (score >= 90) return 'good';
        if (score >= 50) return 'ok';
        return 'bad';
    }

    function showResults(scores, info) {
        document.getElementById('audit-loading').style.display = 'none';
        var resultsEl = document.getElementById('audit-results');
        resultsEl.style.display = '';

        // Calculate social score
        var socialScore = calculateSocialScore(info);
        var marketingScore = calculateMarketingScore(info);

        // Use real scores or fallback
        var perf = scores ? scores.performance : 0;
        var seo = scores ? scores.seo : 0;
        var access = scores ? scores.accessibility : 0;
        var bp = scores ? scores.bestPractices : 0;

        var hasRealScores = scores !== null;

        // Overall score
        var overall;
        if (hasRealScores) {
            overall = Math.round((perf + seo + access + bp + socialScore + marketingScore) / 6);
        } else {
            overall = Math.round((socialScore + marketingScore) / 2);
        }

        // Animate overall score
        var overallEl = document.getElementById('overallScore');
        animateNumber(overallEl, overall);

        // Set score circle border color
        var circle = document.getElementById('overallScoreCircle');
        if (overall >= 80) circle.style.borderColor = '#4ade80';
        else if (overall >= 50) circle.style.borderColor = '#fbbf24';
        else circle.style.borderColor = '#f472b6';

        // Verdict
        var verdictEl = document.getElementById('overallVerdict');
        if (overall >= 80) {
            verdictEl.textContent = 'Your digital presence is strong. There are still opportunities to optimize and grow, but you are ahead of most businesses in your space.';
        } else if (overall >= 60) {
            verdictEl.textContent = 'You have a foundation but there are clear gaps holding you back. Fixing these issues could significantly increase your leads and visibility.';
        } else if (overall >= 40) {
            verdictEl.textContent = 'Your online presence needs serious work. You are likely losing customers to competitors with a stronger digital game. The good news: these are all fixable.';
        } else {
            verdictEl.textContent = 'Your digital presence is critically weak. Potential customers are not finding you, and those who do are not impressed. This is costing you real money every day.';
        }

        // Individual scores
        if (hasRealScores) {
            setScore('perf', perf, getScoreDetail('performance', perf));
            setScore('seo', seo, getScoreDetail('seo', seo));
            setScore('access', access, getScoreDetail('accessibility', access));
            setScore('bp', bp, getScoreDetail('bestPractices', bp));
        } else {
            setScore('perf', 0, 'Could not analyze website. Make sure the URL is correct and publicly accessible.');
            setScore('seo', 0, 'Could not analyze website. Run the audit again with a valid URL.');
            setScore('access', 0, 'Website analysis unavailable.');
            setScore('bp', 0, 'Website analysis unavailable.');
        }
        setScore('social', socialScore, getSocialDetail(info));
        setScore('marketing', marketingScore, getMarketingDetail(info));

        // Generate issues
        var issues = generateIssues(scores, info, hasRealScores);
        var issuesEl = document.getElementById('issuesList');
        issuesEl.innerHTML = '';
        issues.forEach(function (issue) {
            var div = document.createElement('div');
            div.className = 'issue-item';
            div.innerHTML = '<div class="issue-icon ' + issue.severity + '">' +
                (issue.severity === 'critical' ? '!' : issue.severity === 'warning' ? '?' : 'i') +
                '</div><div class="issue-text"><h5>' + issue.title + '</h5><p>' + issue.desc + '</p></div>';
            issuesEl.appendChild(div);
        });

        // Generate recommendations
        var recs = generateRecommendations(scores, info, hasRealScores);
        var recsEl = document.getElementById('recsList');
        recsEl.innerHTML = '';
        recs.forEach(function (rec, i) {
            var div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = '<div class="rec-number">' + (i + 1) + '</div>' +
                '<div class="rec-text"><h5>' + rec.title + '</h5><p>' + rec.desc + '</p></div>';
            recsEl.appendChild(div);
        });

        // Generate help cards
        var helps = generateHelpCards(scores, info, hasRealScores);
        var helpEl = document.getElementById('helpGrid');
        helpEl.innerHTML = '';
        helps.forEach(function (h) {
            var div = document.createElement('div');
            div.className = 'help-card';
            div.innerHTML = '<h5>' + h.title + '</h5><p>' + h.desc + '</p>';
            helpEl.appendChild(div);
        });

        // Scroll to results
        resultsEl.scrollIntoView({ behavior: 'smooth' });
    }

    function setScore(prefix, score, detail) {
        var badge = document.getElementById(prefix + 'Score');
        var bar = document.getElementById(prefix + 'Bar');
        var detailEl = document.getElementById(prefix + 'Detail');

        badge.textContent = score;
        var cls = scoreClass(score);
        badge.className = 'score-badge ' + cls;
        bar.className = 'score-bar ' + cls;
        detailEl.textContent = detail;

        setTimeout(function () {
            bar.style.width = score + '%';
        }, 100);
    }

    function animateNumber(el, target) {
        var current = 0;
        var step = Math.max(1, Math.floor(target / 40));
        var timer = setInterval(function () {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 30);
    }

    function calculateSocialScore(info) {
        var score = 0;
        var platforms = 0;
        if (info.instagram) { score += 20; platforms++; }
        if (info.facebook) { score += 15; platforms++; }
        if (info.tiktok) { score += 15; platforms++; }
        if (info.googleBiz === 'yes-active') { score += 25; platforms++; }
        else if (info.googleBiz === 'yes-outdated') { score += 10; platforms++; }

        // Bonus for having multiple platforms
        if (platforms >= 3) score += 15;
        else if (platforms >= 2) score += 10;

        return Math.min(100, score);
    }

    function calculateMarketingScore(info) {
        var score = 20; // base
        if (info.currentMarketing === 'active') score += 30;
        else if (info.currentMarketing === 'some') score += 20;
        else if (info.currentMarketing === 'social-only') score += 10;
        else if (info.currentMarketing === 'agency') score += 35;

        if (info.challenge === 'everything') score -= 10;
        else if (info.challenge === 'leads') score += 5;

        if (info.googleBiz === 'yes-active') score += 15;
        if (info.instagram && info.facebook) score += 10;

        return Math.max(0, Math.min(100, score));
    }

    function getScoreDetail(category, score) {
        if (category === 'performance') {
            if (score >= 90) return 'Your site loads fast. Great user experience and Google ranking signal.';
            if (score >= 50) return 'Your site is slow on mobile. Visitors are leaving before they even see your content. Every second of load time costs you conversions.';
            return 'Your site is critically slow. Google is penalizing you in search results and most mobile visitors are bouncing before the page loads.';
        }
        if (category === 'seo') {
            if (score >= 90) return 'Strong SEO fundamentals. Your site is set up well for search engines to find and rank you.';
            if (score >= 50) return 'Your SEO has gaps. You are missing opportunities to show up when people search for businesses like yours.';
            return 'Major SEO problems. People searching for your services in your area are not finding you. Your competitors are getting that traffic instead.';
        }
        if (category === 'accessibility') {
            if (score >= 90) return 'Your site is accessible to most users. Good for SEO and legal compliance.';
            if (score >= 50) return 'Accessibility issues found. Some users cannot navigate your site properly, and this also hurts your SEO.';
            return 'Serious accessibility problems. Your site is difficult to use for many visitors and may not meet compliance standards.';
        }
        if (category === 'bestPractices') {
            if (score >= 90) return 'Your site follows modern web standards. Secure and well-built.';
            if (score >= 50) return 'Some technical issues found. These can affect security and user trust.';
            return 'Multiple technical problems. Your site may have security issues or broken features that hurt credibility.';
        }
        return '';
    }

    function getSocialDetail(info) {
        var platforms = [info.instagram, info.facebook, info.tiktok].filter(Boolean).length;
        var hasGoogle = info.googleBiz === 'yes-active' || info.googleBiz === 'yes-outdated';
        if (hasGoogle) platforms++;

        if (platforms >= 3) return 'You have a solid multi-platform presence. The next step is making sure your branding and messaging is consistent across all of them.';
        if (platforms >= 2) return 'You are on a few platforms. Consider expanding to reach more potential customers where they already spend time.';
        if (platforms >= 1) return 'Limited social presence. You are missing out on free exposure to potential customers on major platforms.';
        return 'No social media presence detected. This is a huge missed opportunity. Your competitors are reaching your customers on these platforms right now.';
    }

    function getMarketingDetail(info) {
        if (info.currentMarketing === 'nothing') return 'You are relying entirely on word of mouth. That works until it does not. A digital presence is insurance for your business growth.';
        if (info.currentMarketing === 'social-only') return 'Posting on social media is a start, but without a strategy, consistent schedule, and a website that converts, you are leaving results on the table.';
        if (info.currentMarketing === 'some') return 'You have the pieces but they are not working together. A unified strategy connecting your website, social, and Google presence would multiply your results.';
        if (info.currentMarketing === 'active') return 'You are putting in the effort but not seeing results. This usually means the strategy needs adjusting, not the effort level.';
        if (info.currentMarketing === 'agency') return 'Getting a second opinion is smart. Sometimes a fresh perspective and a different approach is all you need to break through.';
        return 'Understanding your current marketing efforts helps us identify the gaps.';
    }

    function generateIssues(scores, info, hasReal) {
        var issues = [];

        if (hasReal) {
            if (scores.performance < 50) {
                issues.push({ severity: 'critical', title: 'Website is too slow', desc: 'Your site scored ' + scores.performance + '/100 on mobile speed. Pages that take more than 3 seconds to load lose 53% of visitors.' });
            } else if (scores.performance < 90) {
                issues.push({ severity: 'warning', title: 'Website speed could be better', desc: 'Your site scored ' + scores.performance + '/100. Optimizing images, reducing code, and better hosting could speed things up.' });
            }

            if (scores.seo < 50) {
                issues.push({ severity: 'critical', title: 'Poor SEO fundamentals', desc: 'Your site scored ' + scores.seo + '/100 on SEO. Missing meta tags, poor structure, or missing sitemap is keeping you invisible on Google.' });
            } else if (scores.seo < 90) {
                issues.push({ severity: 'warning', title: 'SEO needs improvement', desc: 'Your site scored ' + scores.seo + '/100 on SEO. There are optimizations that would help you rank higher for local searches.' });
            }

            if (scores.accessibility < 50) {
                issues.push({ severity: 'warning', title: 'Accessibility problems', desc: 'Your site scored ' + scores.accessibility + '/100 on accessibility. This affects users with disabilities and hurts your Google ranking.' });
            }

            if (scores.bestPractices < 50) {
                issues.push({ severity: 'warning', title: 'Technical issues detected', desc: 'Your site scored ' + scores.bestPractices + '/100 on best practices. There may be security or compatibility issues.' });
            }
        } else if (info.websiteUrl) {
            issues.push({ severity: 'warning', title: 'Website could not be analyzed', desc: 'We could not reach your website for automated testing. It may be down, blocking requests, or the URL may be incorrect.' });
        }

        if (!info.websiteUrl) {
            issues.push({ severity: 'critical', title: 'No website', desc: 'You do not have a website. This is the foundation of your digital presence. Without one, you are invisible to anyone searching online.' });
        }

        if (!info.instagram && !info.facebook && !info.tiktok) {
            issues.push({ severity: 'critical', title: 'No social media presence', desc: 'You have no social media accounts listed. Your customers are on Instagram, Facebook, and TikTok right now looking for businesses like yours.' });
        } else {
            if (!info.instagram) {
                issues.push({ severity: 'warning', title: 'Missing Instagram', desc: 'Instagram is the top platform for visual businesses. If you offer a service people can see (food, beauty, fitness, spaces), you need to be here.' });
            }
            if (!info.facebook) {
                issues.push({ severity: 'info', title: 'No Facebook page', desc: 'Facebook is still important for local business discovery, reviews, and reaching an older demographic.' });
            }
        }

        if (info.googleBiz === 'no' || info.googleBiz === 'unsure') {
            issues.push({ severity: 'critical', title: 'No Google Business Profile', desc: 'When someone Googles your type of business in your area, you are not showing up in the map results. This is free visibility you are missing.' });
        } else if (info.googleBiz === 'yes-outdated') {
            issues.push({ severity: 'warning', title: 'Google Business Profile is outdated', desc: 'An outdated profile with wrong hours, old photos, or missing info makes your business look abandoned.' });
        }

        if (info.currentMarketing === 'nothing') {
            issues.push({ severity: 'critical', title: 'No marketing strategy', desc: 'Relying only on word of mouth means your growth is capped. A basic digital marketing strategy would open up entirely new customer channels.' });
        }

        if (info.challenge === 'everything') {
            issues.push({ severity: 'warning', title: 'Multiple challenges across the board', desc: 'Feeling like everything is broken is common when there is no unified strategy. The fix is usually simpler than it feels.' });
        }

        return issues;
    }

    function generateRecommendations(scores, info, hasReal) {
        var recs = [];

        // Priority 1: Website
        if (!info.websiteUrl) {
            recs.push({ title: 'Build a professional website', desc: 'This is step one. A clean, fast, mobile-friendly website with clear calls to action gives you a home base for everything else.' });
        } else if (hasReal && scores.performance < 50) {
            recs.push({ title: 'Fix your website speed', desc: 'Compress images, clean up code, and consider better hosting. A fast site keeps visitors and ranks higher on Google.' });
        }

        if (hasReal && scores.seo < 80) {
            recs.push({ title: 'Improve your SEO', desc: 'Add proper meta titles and descriptions, create a sitemap, use heading tags correctly, and make sure your content mentions the services you offer in the areas you serve.' });
        }

        // Priority 2: Google
        if (info.googleBiz === 'no' || info.googleBiz === 'unsure') {
            recs.push({ title: 'Set up Google Business Profile', desc: 'This is free and takes 15 minutes. Add your hours, photos, services, and start collecting reviews. This alone can drive new customers.' });
        } else if (info.googleBiz === 'yes-outdated') {
            recs.push({ title: 'Update your Google Business Profile', desc: 'Add current photos, update hours, list all services, and respond to reviews. An active profile ranks higher in local results.' });
        }

        // Priority 3: Social
        if (!info.instagram) {
            recs.push({ title: 'Create an Instagram presence', desc: 'Post consistently (3-5x per week), use local hashtags, share before/afters or behind-the-scenes content, and engage with your community.' });
        }

        if (!info.instagram && !info.facebook && !info.tiktok) {
            recs.push({ title: 'Pick two platforms and commit', desc: 'You don not need to be everywhere. Pick the two platforms where your customers are and show up consistently. Quality over quantity.' });
        }

        // Priority 4: Strategy
        if (info.currentMarketing === 'nothing' || info.currentMarketing === 'social-only') {
            recs.push({ title: 'Build a content strategy', desc: 'Plan your content a month ahead. Mix educational posts, behind-the-scenes, client results, and calls to action. Consistency beats virality.' });
        }

        if (info.challenge === 'leads') {
            recs.push({ title: 'Optimize your conversion funnel', desc: 'If you are getting traffic but not converting, the problem is your website or booking flow. Make your CTA obvious, reduce friction, and add social proof.' });
        }

        if (info.challenge === 'brand') {
            recs.push({ title: 'Invest in brand consistency', desc: 'Your logo, colors, fonts, and tone should be the same everywhere: website, social media, Google, business cards. Inconsistency makes you look unprofessional.' });
        }

        // Always recommend
        recs.push({ title: 'Get a professional audit and action plan', desc: 'This automated report shows you the big picture. A hands-on audit from me will dig into the specifics of your business, your competitors, and your market to build a custom plan.' });

        return recs;
    }

    function generateHelpCards(scores, info, hasReal) {
        var cards = [];

        if (!info.websiteUrl || (hasReal && scores.performance < 70)) {
            cards.push({ title: 'Website Design or Redesign', desc: 'I will build you a fast, beautiful, mobile-first website that actually converts visitors into customers. Custom code, not a template.' });
        }

        if (hasReal && scores.seo < 80) {
            cards.push({ title: 'SEO Optimization', desc: 'I will optimize your site structure, meta tags, content, and local SEO so people searching for your services find you first.' });
        }

        if (!info.instagram || !info.facebook || !info.tiktok) {
            cards.push({ title: 'Social Media Setup and Strategy', desc: 'I will set up your profiles, create a content calendar, and give you a system for posting consistently without it taking over your life.' });
        }

        if (info.challenge === 'brand') {
            cards.push({ title: 'Brand Identity Package', desc: 'I will create a cohesive visual identity: colors, fonts, photography style, social templates, and brand guidelines that make you look established.' });
        }

        if (info.googleBiz !== 'yes-active') {
            cards.push({ title: 'Google Business Optimization', desc: 'I will set up or optimize your Google Business Profile so you show up in local searches and map results with a professional listing.' });
        }

        cards.push({ title: 'Full Digital Marketing Package', desc: 'Website + SEO + social media + brand, all handled. One person, one vision, everything consistent. Monthly management available.' });

        return cards;
    }
})();
