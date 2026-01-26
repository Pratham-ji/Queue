import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ContentPageNavigation = NativeStackNavigationProp<
  any,
  "ContentPage",
  undefined
>;

export const useContentNavigation = () => {
  const navigation = useNavigation<ContentPageNavigation>();

  const navigateToPage = (slug: string, title?: string) => {
    navigation.push("ContentPage", {
      slug,
      title: title || slug.replace(/-/g, " "),
    });
  };

  return { navigateToPage };
};
