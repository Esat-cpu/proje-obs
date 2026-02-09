# CONTRIBUTING

Bir işe başlamadan önce işin türü (\<tür>) aşağıdaki kurallara göre belirlenir:

`feat`: Yeni bir özellik, davranış, dosya vb. ekleneceği zaman kullanılır.

`refactor`: Kodda değişiklik yapılıyorsa fakat kodun davranışı değişmiyorsa kullanılır.
Örneğin kodu modülerleştirmek, değişken isimlerini daha açık yazmak, bir dosyayı veya fonksiyonu ayırmak gibi.

`fix`: Bir sorun düzeltildiğinde kullanılır.

`test`: Test kodu eklendiğinde, geliştirildiğinde kullanılır.

`docs`: Dokümantasyonlar ve README gibi dosyalarla ilgili gelişmelerde kullanılır.

`chore`: Kodun kendisinden çok build sistemi ile alakalı, çalıştırılması ile alakalı geliştirmelerde kullanılır.
Örneğin docker ile alakalı şeylerin geliştirilmesi.

`revert`: Commit geri almak istiyorsak (Bu çok nadir olmalı)


Github'dan diğer üyelerin yaptığı değişiklikler çekilir, branch açılır ve o branch'e geçilir:
```bash
git pull  # main branch'te iken
git checkout -b <tür>/görev-adı  # örneğin feat/login-sayfası, docs/readme-typo
```
>Not: Eğer bir issue ile ilişkili branch açıyorsanız issue numarası \<No> olmak üzere
> branch adını `<tür>/<No>-görev-adı` yapabilirsiniz. Pull Request'te de Closes #\<No> yazarsanız
> PR merge edildiğinde issue otomatik olarak kapanır.

Değişiklikler commit'ler ile yapılır. Commit atarken:
```bash
git add .   # Değişiklikleri al
git commit -m "<tür>: commit'te yapılan işi emir kipi (imperative mood) ile belirt"
# örnek commit mesajı "feat: login sayfası ekle" veya "docs: README.md dosyasında typo düzelt"
git push origin <tür>/görev-adı # branch adı ile push ettik
```

İlgili branch için tüm commit'leri attığınızı düşünüyorsanız Github'a girip o branch için bir Pull Request oluşturursunuz.
Pull Request'iniz kabul edilmeden önce yorumları kontrol ederseniz değişiklik hakkında diğer üyelerin fikirleri ile yaptıklarınızda değiştirmeler yapabilirsiniz.

>Not: commit mesajı kısa, direkt ve yapılan işi açıklar şekilde olmalıdır. Detayların belirtilmesi için iki alt satıra geçip
> ifade başına `-` karakteri koyarak detay ifadelerini girebilirsiniz. Detay belirtmeniz önemlidir ve önerilir.
> Örnek:
>
> feat: login sayfası ekle
>
> \- templates/login.html dosyası oluştur \
> \- Çeviri dosyalarını güncelle


## Main Branch Kuralları

- main branch'e doğrudan commit atılmaz.
- Tüm değişiklikler Pull Request üzerinden yapılır.
- Merge işlemini tek bir üye yaparsa çakışmalar ve bozulmalar minimuma iner.
